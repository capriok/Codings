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
  /** Number of backspace presses */
  backspaces: number
  /** Previous typed length (to detect backspaces) */
  prevTypedLen: number
}

/**
 * Create a fresh session refs object.
 */
export function createSessionRefs(): SessionRefs {
  return {
    startMs: null,
    firstRenderMs: Date.now(),
    keystrokes: [],
    backspaces: 0,
    prevTypedLen: 0,
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
  refs.backspaces = 0
  refs.prevTypedLen = 0
}
