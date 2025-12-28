import { PROMPTS } from "@/lib/prompts"
import type { Difficulty, PromptLines } from "@/lib/types"

/**
 * Find the first prompt matching the given criteria.
 * Used for initial/deterministic prompt selection.
 */
export function findFirstPromptIndex(lines: PromptLines, difficulty: Difficulty): number {
  for (let i = 0; i < PROMPTS.length; i++) {
    const p = PROMPTS[i]
    if (p?.lines === lines && p.difficulty === difficulty) {
      return i
    }
  }
  return 0
}

/**
 * Find all prompt indices matching the given criteria.
 */
export function findEligiblePromptIndices(
  lines: PromptLines,
  difficulty: Difficulty
): number[] {
  const eligible: number[] = []
  for (let i = 0; i < PROMPTS.length; i++) {
    const p = PROMPTS[i]
    if (p?.lines === lines && p.difficulty === difficulty) {
      eligible.push(i)
    }
  }
  return eligible
}

/**
 * Pick a random prompt matching the given criteria.
 */
export function pickRandomPromptIndex(
  lines: PromptLines,
  difficulty: Difficulty
): number {
  const eligible = findEligiblePromptIndices(lines, difficulty)
  if (eligible.length === 0) return 0
  return eligible[Math.floor(Math.random() * eligible.length)]!
}

/**
 * Get the prompt at a given index.
 */
export function getPrompt(index: number) {
  return PROMPTS[index] ?? PROMPTS[0]!
}
