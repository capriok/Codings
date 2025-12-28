import { computeScore } from "@/lib/score"

function isScoreInput(
  x: any
): x is { correctCharacters: number; totalTypedCharacters: number; timeMs: number } {
  return (
    x &&
    typeof x.correctCharacters === "number" &&
    Number.isFinite(x.correctCharacters) &&
    typeof x.totalTypedCharacters === "number" &&
    Number.isFinite(x.totalTypedCharacters) &&
    typeof x.timeMs === "number" &&
    Number.isFinite(x.timeMs)
  )
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!isScoreInput(body)) {
      return new Response(JSON.stringify({ error: "Invalid fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    const result = computeScore({
      correctCharacters: body.correctCharacters,
      totalTypedCharacters: body.totalTypedCharacters,
      timeMs: body.timeMs,
    })
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
}
