// IO discipline (see src/shared/hook-io.ts): this handler is PURE. It returns a
// HookResult and MUST NOT call process.stderr.write / process.stdout.write /
// console.* / process.exit. logger.* calls are DIAGNOSTIC; thrown errors are
// caught by hookCommand and routed through emitBlockingError.
import type { EventHandler, NormalizedHookInput, HookResult } from '../types.js';
import {
  executeWithWorkerFallback as defaultExecuteWithWorkerFallback,
  isWorkerFallback as defaultIsWorkerFallback,
} from '../../shared/worker-utils.js';
import { getProjectContext } from '../../utils/project-name.js';
import { logger } from '../../utils/logger.js';
import { HOOK_EXIT_CODES } from '../../shared/hook-constants.js';
import { shouldTrackProject as defaultShouldTrackProject } from '../../shared/should-track-project.js';
import { loadFromFileOnce as defaultLoadFromFileOnce } from '../../shared/hook-settings.js';
import { normalizePlatformSource } from '../../shared/platform-source.js';
import {
  isInternalProtocolPayload,
  SYSTEM_REMINDER_OPEN,
  SYSTEM_REMINDER_CLOSE,
} from '../../utils/tag-stripping.js';
import { CONTEXT_TAG_OPEN, CONTEXT_TAG_CLOSE } from '../../utils/context-injection.js';
import { renderWorkingMemory } from '../../services/working/render.js';
import type { WorkingEntry, WorkingLimits } from '../../services/working/store.js';
import {
  resolveRuntimeContext as defaultResolveRuntimeContext,
  logServerFallback as defaultLogServerFallback,
  type ServerRuntimeContext,
} from '../../services/hooks/runtime-selector.js';
import { isServerClientError } from '../../services/hooks/server-client.js';

interface SessionInitResponse {
  sessionDbId: number;
  promptNumber: number;
  skipped?: boolean;
  reason?: string;
  contextInjected?: boolean;
}

interface SemanticContextResponse {
  context: string;
  count: number;
  globalContext?: string;
  globalCount?: number;
  annotations?: {
    attempted: boolean;
    kept: number;
    dropped: number;
    durationMs: number;
    timedOut: boolean;
  };
}

interface WorkingMemoryResponse {
  entries: WorkingEntry[];
  tokens: number;
  limits: WorkingLimits;
}

const defaultDependencies = {
  executeWithWorkerFallback: defaultExecuteWithWorkerFallback,
  isWorkerFallback: defaultIsWorkerFallback,
  loadFromFileOnce: defaultLoadFromFileOnce,
  resolveRuntimeContext: defaultResolveRuntimeContext,
  logServerFallback: defaultLogServerFallback,
  shouldTrackProject: defaultShouldTrackProject,
};

let dependencies = defaultDependencies;

export function setSessionInitDependenciesForTesting(
  overrides: Partial<typeof defaultDependencies> = {},
): void {
  dependencies = { ...defaultDependencies, ...overrides };
}

export const sessionInitHandler: EventHandler = {
  async execute(input: NormalizedHookInput): Promise<HookResult> {
    const { sessionId, prompt: rawPrompt } = input;
    const cwd = input.cwd ?? process.cwd();  

    if (!sessionId) {
      logger.warn('HOOK', 'session-init: No sessionId provided, skipping (Codex CLI or unknown platform)');
      return { continue: true, suppressOutput: true, exitCode: HOOK_EXIT_CODES.SUCCESS };
    }

    if (!dependencies.shouldTrackProject(cwd)) {
      logger.info('HOOK', 'Project excluded from tracking', { cwd });
      return { continue: true, suppressOutput: true };
    }

    if (rawPrompt && isInternalProtocolPayload(rawPrompt)) {
      logger.debug('HOOK', 'session-init: skipping internal protocol payload', {
        preview: rawPrompt.slice(0, 80),
      });
      return { continue: true, suppressOutput: true };
    }

    const prompt = (!rawPrompt || !rawPrompt.trim()) ? '[media prompt]' : rawPrompt;

    const project = getProjectContext(cwd).primary;
    const platformSource = normalizePlatformSource(input.platform);
    const settings = dependencies.loadFromFileOnce();
    const semanticInject =
      String(settings.CLAUDE_MEM_SEMANTIC_INJECT).toLowerCase() === 'true';

    const runtime = dependencies.resolveRuntimeContext();
    // Phase 1a (cmem-sdk rename): `runtime.runtime` is the canonical `'server'`
    // value. Legacy `'server-beta'` is normalized inside `selectRuntime()`.
    if (runtime.runtime === 'server') {
      try {
        await startServerSession(runtime, input, sessionId, platformSource, project, prompt);
        // Server does not currently support the same context-injection
        // protocol as the worker. Skip semantic injection in server mode
        // until the server context endpoint exists.
        return { continue: true, suppressOutput: true };
      } catch (error: unknown) {
        if (isServerClientError(error) && error.isFallbackEligible()) {
          dependencies.logServerFallback(error.kind, {
            status: error.status,
            message: error.message,
            route: '/v1/sessions/start',
          });
          // fall through to worker fallback
        } else {
          logger.error('HOOK', 'Server session-start failed (non-recoverable)', {
            error: error instanceof Error ? error.message : String(error),
          });
          return { continue: true, suppressOutput: true, exitCode: HOOK_EXIT_CODES.SUCCESS };
        }
      }
    }

    logger.debug('HOOK', 'session-init: Calling /api/sessions/init', { contentSessionId: sessionId, project });

    const initResult = await dependencies.executeWithWorkerFallback<SessionInitResponse>(
      '/api/sessions/init',
      'POST',
      {
        contentSessionId: sessionId,
        project,
        prompt,
        platformSource,
      },
    );

    if (dependencies.isWorkerFallback(initResult)) {
      return { continue: true, suppressOutput: true, exitCode: HOOK_EXIT_CODES.SUCCESS };
    }

    if (typeof initResult?.sessionDbId !== 'number') {
      logger.failure('HOOK', 'Session initialization returned malformed response', { contentSessionId: sessionId, project });
      return { continue: true, suppressOutput: true, exitCode: HOOK_EXIT_CODES.SUCCESS };
    }

    const sessionDbId = initResult.sessionDbId;
    const promptNumber = initResult.promptNumber;

    logger.debug('HOOK', 'session-init: Received from /api/sessions/init', { sessionDbId, promptNumber, skipped: initResult.skipped, contextInjected: initResult.contextInjected });

    logger.debug('HOOK', `[ALIGNMENT] Hook Entry | contentSessionId=${sessionId} | prompt#=${promptNumber} | sessionDbId=${sessionDbId}`);

    if (initResult.skipped && initResult.reason === 'private') {
      logger.info('HOOK', `INIT_COMPLETE | sessionDbId=${sessionDbId} | promptNumber=${promptNumber} | skipped=true | reason=private`, {
        sessionId: sessionDbId
      });
      return { continue: true, suppressOutput: true };
    }

    let additionalContext = '';
    // Kept out of additionalContext on purpose — emitted in its own
    // <system-reminder> wrapper at the end (see the working-memory block).
    let workingNudge = '';

    // Kimi Code DISCARDS SessionStart hook results (verified in the installed
    // CLI source, 0.29.1: triggerSessionStart() awaits the trigger and never
    // reads the result; additionalContext is not in its hook schema at all).
    // The only channel that reaches the model is UserPromptSubmit: stdout text
    // (or a JSON `message` field) is appended to context. So the memory block
    // rides the session's FIRST prompt — promptNumber === 1. (An earlier
    // revision keyed on contextInjected === false, but the observer session is
    // finalized on idle after every batch, so EVERY prompt looked "first" and
    // the whole block re-injected each time.)
    if (input.platform === 'kimi' && initResult.promptNumber === 1) {
      const projectsParam = getProjectContext(cwd).allProjects.join(',');
      // Same unified-memory switch as the SessionStart context handler:
      // with the platform filter disabled the param must not be sent at all,
      // otherwise Kimi sessions see only Kimi-era observations again.
      const platformFilterEnabled = settings.CLAUDE_MEM_CONTEXT_PLATFORM_FILTER !== 'false';
      const platformSourceParam = platformFilterEnabled ? '&platformSource=kimi' : '';
      const apiPath = `/api/context/inject?projects=${encodeURIComponent(projectsParam)}${platformSourceParam}`;
      const contextResult = await dependencies.executeWithWorkerFallback<string>(apiPath, 'GET');
      if (!dependencies.isWorkerFallback(contextResult) && typeof contextResult === 'string' && contextResult.trim()) {
        additionalContext = contextResult.trim();
      }
    }

    if (semanticInject && prompt && prompt.length >= 20 && prompt !== '[media prompt]') {
      const limit = settings.CLAUDE_MEM_SEMANTIC_INJECT_LIMIT || '5';
      // Cross-project injection (Palantir-in-`search`-needed-in-`kit` case):
      // 0/absent = off, the worker answers with current-project context only.
      const globalLimit = settings.CLAUDE_MEM_SEMANTIC_INJECT_GLOBAL_LIMIT || '0';
      // Unified memory applies here too: with the platform filter disabled the
      // request must NOT carry platformSource — otherwise the semantic path
      // where-filters Chroma to kimi-only observations and older (claude-era /
      // null-platform) memories become invisible to injection. Observed live
      // 2026-08-07: a GPU-shop query in project `search` never saw the RTX 3090
      // research series because its platform_source was NULL.
      const platformFilterEnabled = settings.CLAUDE_MEM_CONTEXT_PLATFORM_FILTER !== 'false';
      const semanticResult = await dependencies.executeWithWorkerFallback<SemanticContextResponse>(
        '/api/context/semantic',
        'POST',
        {
          q: prompt,
          project,
          limit,
          globalLimit,
          ...(platformFilterEnabled ? { platformSource } : {}),
        },
      );
      if (!dependencies.isWorkerFallback(semanticResult) && semanticResult?.context) {
        logger.debug('HOOK', `Semantic injection: ${semanticResult.count} observations for prompt`, { sessionId: sessionDbId, count: semanticResult.count });
        additionalContext = additionalContext
          ? `${additionalContext}\n\n${semanticResult.context}`
          : semanticResult.context;
      }
      if (!dependencies.isWorkerFallback(semanticResult) && semanticResult?.annotations?.attempted) {
        logger.debug('HOOK', `Semantic annotation: kept=${semanticResult.annotations.kept} dropped=${semanticResult.annotations.dropped} in ${semanticResult.annotations.durationMs}ms${semanticResult.annotations.timedOut ? ' (timed out)' : ''}`, { sessionId: sessionDbId, ...semanticResult.annotations });
      }
      if (!dependencies.isWorkerFallback(semanticResult) && semanticResult?.globalContext) {
        logger.debug('HOOK', `Cross-project semantic injection: ${semanticResult.globalCount} memories for prompt`, { sessionId: sessionDbId, count: semanticResult.globalCount });
        additionalContext = additionalContext
          ? `${additionalContext}\n\n${semanticResult.globalContext}`
          : semanticResult.globalContext;
      }
    }

    // Working memory rides EVERY prompt (unlike the semantic block, no length
    // gate): stale state must stay visible to the agent's eyes — that
    // visibility is the structural defense against "forgot to write".
    //
    // The state block and the nudge travel on DIFFERENT channels (2026-08-29).
    // The block is reference material and joins additionalContext inside
    // <claude-mem-context>; the nudge asks the agent to act NOW and is emitted
    // in its own <system-reminder> wrapper. Reason: a context block is, by the
    // agent's own operating rules, background reference — a reminder buried in
    // it was ignored ~20 consecutive times in one live session while every
    // hard rule delivered through an instruction channel was obeyed. Both tags
    // are stripped by tag-stripping.ts, so neither is re-ingested.
    //
    // Fail-open: a worker hiccup must never break the hook.
    const workingEnabled = String(settings.CLAUDE_MEM_WORKING_ENABLED ?? 'true').toLowerCase() === 'true';
    if (workingEnabled) {
      try {
        const workingResult = await dependencies.executeWithWorkerFallback<WorkingMemoryResponse>(
          // reason=inject marks this read as the per-prompt injection, so the
          // worker counts it for nudge telemetry (an MCP working_list must not
          // land in the same denominator).
          `/api/working?project=${encodeURIComponent(project)}&reason=inject`,
          'GET',
        );
        if (!dependencies.isWorkerFallback(workingResult) && workingResult) {
          const { block, nudge } = renderWorkingMemory({ entries: workingResult.entries ?? [] });
          if (block) {
            additionalContext = additionalContext
              ? `${additionalContext}\n\n${block}`
              : block;
          }
          // The substantial-prompt gate stays on the NUDGE only: a one-word
          // follow-up does not warrant an instruction to go write state, but
          // it must never suppress the block, which is just current state.
          const promptIsSubstantial =
            prompt.length >= 20 && prompt !== '[media prompt]';
          if (nudge && promptIsSubstantial) {
            workingNudge = nudge;
          }
        }
      } catch (error: unknown) {
        logger.warn('HOOK', 'Working-memory injection failed (ignored)', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    logger.info('HOOK', `INIT_COMPLETE | sessionDbId=${sessionDbId} | promptNumber=${promptNumber} | project=${project}`, {
      sessionId: sessionDbId
    });

    if (additionalContext || workingNudge) {
      // Both wrappers are strip-tags targets (tag-stripping.ts), so injected
      // memory never comes back as an observation. They stay SEPARATE
      // top-level blocks: nesting the reminder inside the context block would
      // re-file the instruction as background reference — the delivery-channel
      // bug this split fixes.
      const parts: string[] = [];
      if (additionalContext) {
        parts.push(`${CONTEXT_TAG_OPEN}\n${additionalContext}\n${CONTEXT_TAG_CLOSE}`);
      }
      if (workingNudge) {
        parts.push(`${SYSTEM_REMINDER_OPEN}\n${workingNudge}\n${SYSTEM_REMINDER_CLOSE}`);
      }
      return {
        continue: true,
        suppressOutput: true,
        hookSpecificOutput: {
          hookEventName: 'UserPromptSubmit',
          additionalContext: parts.join('\n\n')
        }
      };
    }

    return { continue: true, suppressOutput: true };
  }
};

async function startServerSession(
  runtime: ServerRuntimeContext,
  input: NormalizedHookInput,
  sessionId: string,
  platformSource: string,
  project: string,
  prompt: string,
): Promise<void> {
  await runtime.client.startSession({
    projectId: runtime.projectId,
    externalSessionId: sessionId,
    contentSessionId: sessionId,
    agentId: input.agentId ?? null,
    agentType: input.agentType ?? null,
    platformSource,
    metadata: { project, prompt },
  });
  logger.info('HOOK', 'session-init: server session started', {
    contentSessionId: sessionId,
    project,
  });
}

function parseSemanticInjectLimit(value: string | number): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 5;
  return parsed;
}
