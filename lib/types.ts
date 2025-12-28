export type Difficulty = "easy" | "medium" | "hard"
export type Language = "ts"

export interface Prompt {
  id: string
  language: Language
  code: string
  difficulty: Difficulty
}

export interface RaceResult {
  correctCharacters: number
  totalTypedCharacters: number
  timeMs: number
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
}

export type Screen = "home" | "race" | "results"
