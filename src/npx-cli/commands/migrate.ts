import { styleText } from 'node:util';
import { join } from 'path';
import { homedir } from 'os';
import {
  planDataDirMigration,
  performDataDirMigration,
  formatBytes,
  type MigrationPlan,
} from '../../shared/data-dir-migration.js';

/**
 * `hummem migrate` — move a legacy claude-mem data directory to ~/.hummem.
 *
 * Dry-run is the default. This command moves a user's entire memory, often
 * close to a gigabyte, and the failure modes are silent rather than loud: a
 * settings key pinned to the old path makes a "successful" migration change
 * nothing, and copying a live SQLite database corrupts it. Showing the plan
 * first and requiring `--apply` costs one extra command and removes the class
 * of mistake where someone discovers the problem after the fact.
 */

export interface MigrateOptions {
  from?: string;
  to?: string;
  apply?: boolean;
  move?: boolean;
  /** Confirms the irreversible deletion performed by --move. */
  yes?: boolean;
}

export function parseMigrateOptions(args: string[]): MigrateOptions {
  const options: MigrateOptions = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--apply') options.apply = true;
    else if (arg === '--yes' || arg === '-y') options.yes = true;
    else if (arg === '--move') options.move = true;
    else if (arg === '--from') options.from = args[++i];
    else if (arg === '--to') options.to = args[++i];
    else if (arg.startsWith('--from=')) options.from = arg.slice('--from='.length);
    else if (arg.startsWith('--to=')) options.to = arg.slice('--to='.length);
  }
  return options;
}

function printPlan(plan: MigrationPlan): void {
  const mode = plan.mode === 'move' ? 'move' : 'copy';
  console.log(styleText('bold', '\nhummem migrate\n'));
  console.log(`  from   ${plan.sourceDir}`);
  console.log(`  to     ${plan.targetDir}`);
  console.log(`  mode   ${mode}\n`);

  const migrated = plan.entries.filter((e) => !e.skipped);
  const skipped = plan.entries.filter((e) => e.skipped);

  if (migrated.length > 0) {
    console.log(styleText('bold', '  Will migrate'));
    for (const entry of migrated) {
      const size = styleText('dim', formatBytes(entry.bytes).padStart(9));
      const note = entry.note ? styleText('cyan', `  — ${entry.note}`) : '';
      console.log(`    ${size}  ${entry.name}${note}`);
    }
    console.log('');
  }

  if (skipped.length > 0) {
    console.log(styleText('bold', '  Will skip'));
    for (const entry of skipped) {
      console.log(
        `    ${styleText('dim', formatBytes(entry.bytes).padStart(9))}  ` +
          `${entry.name} ${styleText('dim', `— ${entry.skipped}`)}`
      );
    }
    console.log('');
  }

  console.log(
    `  ${styleText('bold', 'Total')}  ${formatBytes(plan.copiedBytes)} migrated` +
      (plan.mode === 'copy'
        ? `, source left in place (${formatBytes(plan.totalBytes)} stays on disk)`
        : ', source reclaimed')
  );

  for (const warning of plan.warnings) {
    console.log(`\n  ${styleText('yellow', '!')} ${warning}`);
  }

  if (plan.mode === 'move') {
    // The only irreversible path in this command.
    console.log(
      `\n  ${styleText('yellow', '!')} ${styleText('bold', '--move deletes the source.')} ` +
        'It is removed only after the copy is verified, but once removed there ' +
        'is no undo. Use the default copy mode unless you are short on disk.'
    );
  }
}

function printBlockers(plan: MigrationPlan): void {
  console.error(styleText('red', `\n  Cannot migrate — ${plan.blockers.length} problem(s):\n`));
  for (const blocker of plan.blockers) {
    console.error(`  ${styleText('red', '✗')} ${blocker.message}`);
    console.error(`    ${styleText('dim', blocker.remediation)}\n`);
  }
}

export async function runMigrateCommand(options: MigrateOptions = {}): Promise<void> {
  const sourceDir = options.from ?? join(homedir(), '.claude-mem');
  const targetDir = options.to;
  const mode = options.move ? 'move' : 'copy';

  const plan = planDataDirMigration({ sourceDir, targetDir, mode });

  // Nothing to migrate is a normal outcome for a fresh install, not an error.
  const onlyMissingSource =
    plan.blockers.length === 1 && plan.blockers[0].kind === 'source-missing';
  if (onlyMissingSource) {
    console.log(styleText('bold', '\nhummem migrate\n'));
    console.log(`  ${styleText('green', '✓')} ${plan.blockers[0].message}`);
    console.log(`    ${styleText('dim', plan.blockers[0].remediation)}\n`);
    process.exit(0);
  }

  printPlan(plan);

  if (plan.blockers.length > 0) {
    printBlockers(plan);
    process.exit(1);
  }

  if (!options.apply) {
    console.log(
      `\n  ${styleText('dim', 'This was a dry run. Re-run with')} ` +
        `${styleText('cyan', '--apply')} ${styleText('dim', 'to perform it.')}\n`
    );
    process.exit(0);
  }

  if (mode === 'move' && !options.yes) {
    // Deleting a user's only copy of their memory should not be reachable by
    // a single mistyped command.
    console.error(
      `\n  ${styleText('red', '✗')} --move removes ${plan.sourceDir} once the copy is verified.\n` +
        `    ${styleText('dim', 'Re-run with --yes to confirm, or drop --move to keep the source.')}\n`
    );
    process.exit(1);
  }

  const result = performDataDirMigration({ sourceDir, targetDir, mode });

  if (!result.performed) {
    // The directory changed between planning and applying.
    printBlockers(result.plan);
    process.exit(1);
  }

  console.log(
    `\n  ${styleText('green', '✓')} migrated ${result.migratedEntries.length} entr` +
      `${result.migratedEntries.length === 1 ? 'y' : 'ies'} to ${result.plan.targetDir}`
  );

  if (result.verified) {
    console.log(
      `  ${styleText('green', '✓')} every migrated entry matches its source`
    );
  } else if (result.mismatches.length > 0) {
    console.error(
      styleText('red', `\n  ${result.mismatches.length} entr` +
        `${result.mismatches.length === 1 ? 'y does' : 'ies do'} not match the source:`)
    );
    for (const name of result.mismatches) {
      console.error(`    ${styleText('red', '✗')} ${name}`);
    }
    console.error(
      styleText('dim',
        `\n  Your original data is untouched in ${result.plan.sourceDir}.\n` +
        `  Remove ${result.plan.targetDir} and re-run.\n`)
    );
    process.exit(1);
  }

  if (result.rewroteDataDirSetting) {
    // Worth stating: without this the migrated install would silently keep
    // reading the old directory.
    console.log(
      `  ${styleText('green', '✓')} settings.json now points at the new data directory`
    );
  }

  if (result.errors.length > 0) {
    console.error(
      styleText('yellow', `\n  ${result.errors.length} entr` +
        `${result.errors.length === 1 ? 'y' : 'ies'} could not be migrated:`)
    );
    for (const error of result.errors) {
      console.error(`    ${styleText('yellow', '!')} ${error.entry}: ${error.message}`);
    }
    console.error(
      styleText('dim', '\n  The rest migrated successfully; the source is unchanged.\n')
    );
    process.exit(1);
  }

  console.log(
    `\n  ${styleText('dim', 'Verify with')} ${styleText('cyan', 'hummem doctor')}` +
      `${styleText('dim', ', then start with')} ${styleText('cyan', 'hummem start')}${styleText('dim', '.')}`
  );
  if (mode === 'copy') {
    console.log(
      `  ${styleText('dim', 'Your old directory is untouched — remove it once you are satisfied.')}\n`
    );
  } else {
    console.log('');
  }
  process.exit(0);
}
