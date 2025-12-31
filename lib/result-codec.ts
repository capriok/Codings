import type {
  Difficulty,
  Language,
  Prompt,
  PromptLines,
  RunStats,
  ServerScoreResponse,
} from "@/lib/types"

// ─────────────────────────────────────────────────────────────────────────────
// Compact Payload Types (short keys for smaller URLs)
// ─────────────────────────────────────────────────────────────────────────────

interface CompactPrompt {
  id: string
  l: Language // language
  d: Difficulty // difficulty
  n: PromptLines // lines
  c: string // code
}

interface CompactStats {
  w: number // correctWpm
  a: number // accuracy (0..1)
  t: number // durationMs
  sc: number // score
}

interface CompactRunExtras {
  rw: number // rawWpm
  m: number // mistakes
  b: number // backspaces
  cn: number | null // consistency
  fk: number | null // timeToFirstKeyMs
  cc: number // correctChars
  tc: number // targetChars
  tt: number // totalTypedChars
  // New metrics
  pk?: string[] // problemKeys (top 3)
  lp?: number | null // longestPauseMs
  cl?: number | null // avgCorrectionLatencyMs
}

interface ResultPayload {
  p: CompactPrompt
  s: CompactStats
  r: CompactRunExtras
}

// ─────────────────────────────────────────────────────────────────────────────
// Encoding / Decoding
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Encode result data to a URL-safe base64 string.
 */
export function encodeResult(
  prompt: Prompt,
  runStats: RunStats,
  score: ServerScoreResponse | null
): string {
  const payload: ResultPayload = {
    p: {
      id: prompt.id,
      l: prompt.language,
      d: prompt.difficulty,
      n: prompt.lines,
      c: prompt.code,
    },
    s: {
      w: Math.round(runStats.correctWpm * 10) / 10,
      a: Math.round(runStats.accuracy * 1000) / 1000,
      t: Math.round(runStats.durationMs),
      sc: score?.score ?? 0,
    },
    r: {
      rw: Math.round(runStats.rawWpm * 10) / 10,
      m: runStats.mistakes,
      b: runStats.backspaces,
      cn: runStats.consistency,
      fk: runStats.timeToFirstKeyMs != null ? Math.round(runStats.timeToFirstKeyMs) : null,
      cc: runStats.correctChars,
      tc: runStats.targetChars,
      tt: runStats.totalTypedChars,
      pk: runStats.problemKeys.length > 0 ? runStats.problemKeys : undefined,
      lp: runStats.longestPauseMs != null ? Math.round(runStats.longestPauseMs) : undefined,
      cl:
        runStats.avgCorrectionLatencyMs != null
          ? Math.round(runStats.avgCorrectionLatencyMs)
          : undefined,
    },
  }

  const json = JSON.stringify(payload)
  // Use base64url encoding (URL-safe)
  const base64 = btoa(json)
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

/**
 * Decode a URL-safe base64 string back to result data.
 * Returns null if decoding fails.
 */
export function decodeResult(encoded: string): {
  prompt: Prompt
  runStats: RunStats
  score: ServerScoreResponse
} | null {
  try {
    // Restore standard base64 from URL-safe encoding
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/")
    // Add padding if needed
    while (base64.length % 4 !== 0) {
      base64 += "="
    }

    const json = atob(base64)
    const payload = JSON.parse(json) as ResultPayload

    const prompt: Prompt = {
      id: payload.p.id,
      language: payload.p.l,
      difficulty: payload.p.d,
      lines: payload.p.n,
      code: payload.p.c,
    }

    const runStats: RunStats = {
      correctWpm: payload.s.w,
      accuracy: payload.s.a,
      durationMs: payload.s.t,
      rawWpm: payload.r.rw,
      mistakes: payload.r.m,
      backspaces: payload.r.b,
      consistency: payload.r.cn,
      timeToFirstKeyMs: payload.r.fk,
      correctChars: payload.r.cc,
      targetChars: payload.r.tc,
      totalTypedChars: payload.r.tt,
      problemKeys: payload.r.pk ?? [],
      longestPauseMs: payload.r.lp ?? null,
      avgCorrectionLatencyMs: payload.r.cl ?? null,
    }

    const score: ServerScoreResponse = {
      cWPM: payload.s.w,
      accuracy: payload.s.a,
      score: payload.s.sc,
    }

    return { prompt, runStats, score }
  } catch {
    return null
  }
}
