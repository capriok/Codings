import { NextResponse } from "next/server"

import { computeScore } from "@/lib/score"
import type { GameResult, ServerScoreResponse } from "@/lib/types"

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const result = body as Partial<GameResult> | null
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

  const output: ServerScoreResponse = computeScore({
    correctCharacters,
    totalTypedCharacters,
    timeMs,
  })

  return NextResponse.json(output)
}
