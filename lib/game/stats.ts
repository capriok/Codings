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
 * Get top N problem keys sorted by error count.
 */
function getTopProblemKeys(
  problemKeyErrors: Map<string, number>,
  n: number
): string[] {
  return Array.from(problemKeyErrors.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key]) => key)
}

/**
 * Compute average of an array of numbers.
 */
function computeAverage(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

/**
 * Compute longest pause between consecutive keystrokes.
 */
function computeLongestPause(timestamps: number[]): number | null {
  if (timestamps.length < 2) return null

  let longest = 0
  for (let i = 1; i < timestamps.length; i++) {
    const pause = timestamps[i]! - timestamps[i - 1]!
    if (pause > longest) {
      longest = pause
    }
  }

  return longest > 0 ? longest : null
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
  progressKeystrokes: number[]
  timeToFirstKeyMs: number | null
  problemKeyErrors: Map<string, number>
  correctionLatencies: number[]
}): RunStats {
  const {
    correctChars,
    totalTypedChars,
    targetChars,
    durationMs,
    backspaces,
    keystrokes,
    progressKeystrokes,
    timeToFirstKeyMs,
    problemKeyErrors,
    correctionLatencies,
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
    problemKeys: getTopProblemKeys(problemKeyErrors, 3),
    longestPauseMs: computeLongestPause(progressKeystrokes),
    avgCorrectionLatencyMs: computeAverage(correctionLatencies),
  }
}
