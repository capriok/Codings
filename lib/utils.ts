import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Difficulty } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
}

export function formatDifficulty(difficulty: Difficulty): string {
  return DIFFICULTY_LABELS[difficulty]
}

export function formatCodeLines(lines: number): string {
  return `${lines} line${lines === 1 ? "" : "s"}`
}
