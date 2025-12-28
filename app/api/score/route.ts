import { NextResponse } from "next/server"

import { computeScore } from "@/lib/score"
import type { Difficulty, GameResult, ScoringMode, ServerScoreResponse } from "@/lib/types"

const VALID_DIFFICULTIES = new Set<Difficulty>(["easy", "medium", "hard"])
const VALID_SCORING_MODES = new Set<ScoringMode>(["simple", "tuned"])

function isValidDifficulty(value: unknown): value is Difficulty {
  return typeof value === "string" && VALID_DIFFICULTIES.has(value as Difficulty)
}

function isValidScoringMode(value: unknown): value is ScoringMode {
  return typeof value === "string" && VALID_SCORING_MODES.has(value as ScoringMode)
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const result = body as Partial<GameResult> | null

  // Required fields
  const correctCharacters = Number(result?.correctCharacters)
  const totalTypedCharacters = Number(result?.totalTypedCharacters)
  const timeMs = Number(result?.timeMs)

  if (
    !Number.isFinite(correctCharacters) ||
    !Number.isFinite(totalTypedCharacters) ||
    !Number.isFinite(timeMs)
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  if (correctCharacters < 0 || totalTypedCharacters < 0 || timeMs < 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  // Optional extended fields
  const difficulty = isValidDifficulty(result?.difficulty)
    ? result.difficulty
    : "easy"

  const targetChars =
    result?.targetChars != null && Number.isFinite(Number(result.targetChars))
      ? Number(result.targetChars)
      : correctCharacters

  const consistency =
    result?.consistency != null && Number.isFinite(Number(result.consistency))
      ? Number(result.consistency)
      : null

  const scoringMode = isValidScoringMode(result?.scoringMode)
    ? result.scoringMode
    : "tuned"

  const output: ServerScoreResponse = computeScore({
    correctCharacters,
    totalTypedCharacters,
    timeMs,
    difficulty,
    targetChars,
    consistency,
    scoringMode,
  })

  return NextResponse.json(output)
}
