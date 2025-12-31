import type { Difficulty } from "@/lib/types"

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DIFFICULTY_MULTIPLIERS: Record<Difficulty, number> = {
  easy: 1.0,
  medium: 1.15,
  hard: 1.35,
}

const MAX_DIFFICULTY_MULTIPLIER = 1.35
const MAX_CONSISTENCY_MULTIPLIER = 1.2
const ACCURACY_NORMALIZATION_THRESHOLD = 80 // chars

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// ─────────────────────────────────────────────────────────────────────────────
// Multiplier Calculations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get difficulty multiplier for a given difficulty level.
 * Easy = 1.0 (baseline), Medium = 1.15, Hard = 1.35
 */
export function getDifficultyMultiplier(difficulty: Difficulty): number {
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty] ?? 1.0
  return clamp(multiplier, 1.0, MAX_DIFFICULTY_MULTIPLIER)
}

/**
 * Calculate consistency bonus multiplier.
 * Uses quadratic scaling for diminishing returns at higher consistency.
 * Returns 1.0 if consistency is null (no penalty for missing data).
 * Capped at 1.20 maximum bonus.
 */
export function getConsistencyMultiplier(consistency: number | null): number {
  if (consistency === null) return 1.0

  const normalized = clamp(consistency, 0, 100) / 100
  const bonus = normalized ** 2 * 0.2
  const multiplier = 1 + bonus

  return clamp(multiplier, 1.0, MAX_CONSISTENCY_MULTIPLIER)
}

/**
 * Calculate length-normalized effective accuracy.
 * Short snippets (<80 chars) have softened accuracy penalties.
 * Snippets >= 80 chars use raw accuracy unchanged.
 */
export function getEffectiveAccuracy(accuracy: number, targetChars: number): number {
  const t = clamp(targetChars / ACCURACY_NORMALIZATION_THRESHOLD, 0, 1)
  return lerp(1, accuracy, t)
}

// ─────────────────────────────────────────────────────────────────────────────
// Score Calculation
// ─────────────────────────────────────────────────────────────────────────────

export interface ScoreInput {
  correctCharacters: number
  totalTypedCharacters: number
  timeMs: number
  difficulty?: Difficulty
  targetChars?: number
  consistency?: number | null
}

export interface ScoreOutput {
  cWPM: number
  accuracy: number // 0..1 (raw accuracy, for display)
  score: number
}

/**
 * Compute score with all multipliers applied.
 *
 * Formula:
 *   score = cWPM * effectiveAccuracy * difficultyMultiplier * consistencyMultiplier
 *
 * Where:
 *   - cWPM = correctCharacters / 5 / (timeMs / 60000)
 *   - effectiveAccuracy = lerp(1, accuracy, clamp(targetChars / 80, 0, 1))
 *   - difficultyMultiplier = { easy: 1.0, medium: 1.15, hard: 1.35 }
 *   - consistencyMultiplier = 1 + (consistency/100)^2 * 0.20, capped at 1.20
 */
export function computeScore(input: ScoreInput): ScoreOutput {
  const {
    correctCharacters,
    totalTypedCharacters,
    difficulty = "easy",
    targetChars = correctCharacters,
    consistency = null,
  } = input

  const timeMs = Math.max(1, input.timeMs)

  // Core metrics
  const cWPM = correctCharacters / 5 / (timeMs / 60000)
  const accuracy = totalTypedCharacters > 0 ? correctCharacters / totalTypedCharacters : 0

  // Multipliers
  const effectiveAccuracy = getEffectiveAccuracy(accuracy, targetChars)
  const difficultyMultiplier = getDifficultyMultiplier(difficulty)
  const consistencyMultiplier = getConsistencyMultiplier(consistency)

  // Final score with all multipliers
  const score = cWPM * effectiveAccuracy * difficultyMultiplier * consistencyMultiplier

  return {
    cWPM,
    accuracy,
    score,
  }
}
