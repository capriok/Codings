import type { RunStats } from "@/lib/types"

/**
 * Compute typing consistency score (0-100) based on keystroke intervals.
 * Returns null if not enough data points.
 */
export function computeConsistency(timestamps: number[]): number | null {
  if (timestamps.length < 4) return null

  const intervals: number[] = []
  for (let i = 1; i < timestamps.length; i++) {
    const d = timestamps[i]! - timestamps[i - 1]!
    if (d > 0) intervals.push(d)
  }
  if (intervals.length < 3) return null

  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length
  if (mean <= 0) return null

  const variance =
    intervals.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0) / intervals.length
  const sd = Math.sqrt(variance)
  const cv = sd / mean
  const score = Math.max(0, Math.min(100, 100 - cv * 100))

  return Math.round(score)
}

/**
 * Compute WPM from character count and duration.
 * Standard: 5 characters = 1 word
 */
export function computeWpm(chars: number, durationMs: number): number {
  if (durationMs <= 0) return 0
  return chars / 5 / (durationMs / 60000)
}

/**
 * Compute all run statistics after a typing session completes.
 */
export function computeRunStats(params: {
  correctChars: number
  totalTypedChars: number
  targetChars: number
  durationMs: number
  backspaces: number
  keystrokes: number[]
  timeToFirstKeyMs: number | null
}): RunStats {
  const {
    correctChars,
    totalTypedChars,
    targetChars,
    durationMs,
    backspaces,
    keystrokes,
    timeToFirstKeyMs,
  } = params

  const mistakes = Math.max(0, totalTypedChars - correctChars)
  const accuracy = totalTypedChars > 0 ? correctChars / totalTypedChars : 0
  const rawWpm = computeWpm(totalTypedChars, durationMs)
  const correctWpm = computeWpm(correctChars, durationMs)

  return {
    durationMs,
    timeToFirstKeyMs,
    targetChars,
    correctChars,
    totalTypedChars,
    mistakes,
    backspaces,
    rawWpm,
    correctWpm,
    accuracy,
    consistency: computeConsistency(keystrokes),
  }
}
