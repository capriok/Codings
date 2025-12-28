export interface ScoreInput {
  correctCharacters: number
  totalTypedCharacters: number
  timeMs: number
}

export interface ScoreOutput {
  cWPM: number
  accuracy: number // 0..1
  score: number
}

export function computeScore(input: ScoreInput): ScoreOutput {
  const { correctCharacters, totalTypedCharacters } = input
  const timeMs = Math.max(1, input.timeMs) // avoid divide-by-zero
  const cWPM = correctCharacters / 5 / (timeMs / 60000)
  const accuracy = totalTypedCharacters > 0 ? correctCharacters / totalTypedCharacters : 0
  const score = cWPM * accuracy
  return { cWPM, accuracy, score }
}
