export type Difficulty = "easy" | "medium" | "hard"
export type ScoringMode = "simple" | "tuned"
export type Language = "ts"

export type PromptLines = 1 | 2 | 3

export interface Prompt {
  id: string
  language: Language
  code: string
  difficulty: Difficulty
  lines: PromptLines
}

export interface RunStats {
  durationMs: number
  timeToFirstKeyMs: number | null
  targetChars: number
  correctChars: number
  totalTypedChars: number
  mistakes: number
  backspaces: number
  rawWpm: number
  correctWpm: number
  accuracy: number // 0..1
  consistency: number | null // 0..100
  // New metrics
  problemKeys: string[] // Top 3 keys that caused errors (most problematic first)
  longestPauseMs: number | null // Longest pause between keystrokes after starting
  avgCorrectionLatencyMs: number | null // Average time to press backspace after error
}

export interface GameResult {
  correctCharacters: number
  totalTypedCharacters: number
  timeMs: number
  // Extended fields for tuned scoring
  difficulty?: Difficulty
  targetChars?: number
  consistency?: number | null
  scoringMode?: ScoringMode
}

export interface ScoreBreakdown {
  cWPM: number
  accuracy: number // 0..1
  score: number
}

export type ServerScoreResponse = ScoreBreakdown

export interface EditorProgress {
  typed: string
  correctCharacters: number
  totalTypedCharacters: number
  error: boolean
  keystrokeTs: number
  expectedChar?: string // The character that was expected (set when error is true)
  isErrorRecovery?: boolean // True when backspace clears an error state
}

export type Screen = "home" | "game" | "encoding" | "results"
