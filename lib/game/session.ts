/**
 * Mutable session data tracked via refs during a typing run.
 * Kept separate from React state to avoid re-renders on every keystroke.
 */
export interface SessionRefs {
  /** Timestamp of first keystroke (null until typing starts) */
  startMs: number | null
  /** Timestamp when the editor first rendered */
  firstRenderMs: number
  /** All keystroke timestamps for consistency calculation */
  keystrokes: number[]
  /** Forward-progress keystroke timestamps for pause tracking (excludes backspaces/errors) */
  progressKeystrokes: number[]
  /** Number of backspace presses */
  backspaces: number
  /** Previous typed length (to detect backspaces) */
  prevTypedLen: number
  /** Map of expected char -> error count for problem keys tracking */
  problemKeyErrors: Map<string, number>
  /** Timestamp when the current error occurred (for correction latency) */
  errorTs: number | null
  /** Array of correction latencies (time from error to backspace) */
  correctionLatencies: number[]
}

/**
 * Create a fresh session refs object.
 */
export function createSessionRefs(): SessionRefs {
  return {
    startMs: null,
    firstRenderMs: Date.now(),
    keystrokes: [],
    progressKeystrokes: [],
    backspaces: 0,
    prevTypedLen: 0,
    problemKeyErrors: new Map(),
    errorTs: null,
    correctionLatencies: [],
  }
}

/**
 * Reset session refs in-place (mutates the object).
 * More efficient than creating new object when we have a ref.
 */
export function resetSessionRefs(refs: SessionRefs): void {
  refs.startMs = null
  refs.firstRenderMs = Date.now()
  refs.keystrokes = []
  refs.progressKeystrokes = []
  refs.backspaces = 0
  refs.prevTypedLen = 0
  refs.problemKeyErrors = new Map()
  refs.errorTs = null
  refs.correctionLatencies = []
}
