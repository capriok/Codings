"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { PROMPTS } from "@/lib/prompts"
import type {
  Difficulty,
  EditorProgress,
  PromptLines,
  GameResult,
  RunStats,
  Screen,
  ServerScoreResponse,
} from "@/lib/types"
import { useScoreApi } from "@/lib/hooks/use-score-api"

const LENGTHS = [1, 2, 3] as const satisfies readonly PromptLines[]
export type GameLength = (typeof LENGTHS)[number]

const DIFFICULTIES = ["easy", "medium", "hard"] as const satisfies readonly Difficulty[]
export type GameDifficulty = (typeof DIFFICULTIES)[number]

function firstPromptIndex(lines: GameLength, difficulty: GameDifficulty) {
  for (let i = 0; i < PROMPTS.length; i++) {
    const p = PROMPTS[i]
    if (!p) continue
    if (p.lines !== lines) continue
    if (p.difficulty !== difficulty) continue
    return i
  }
  return 0
}

function randomPromptIndex(lines: GameLength, difficulty: GameDifficulty) {
  const eligible: number[] = []
  for (let i = 0; i < PROMPTS.length; i++) {
    const p = PROMPTS[i]
    if (!p) continue
    if (p.lines !== lines) continue
    if (p.difficulty !== difficulty) continue
    eligible.push(i)
  }

  // fallback (shouldn't happen if data is correct)
  if (eligible.length === 0) return 0

  return eligible[Math.floor(Math.random() * eligible.length)]!
}

function computeConsistency(timestamps: number[]): number | null {
  if (timestamps.length < 4) return null
  const intervals: number[] = []
  for (let i = 1; i < timestamps.length; i++) {
    const d = timestamps[i]! - timestamps[i - 1]!
    if (d > 0) intervals.push(d)
  }
  if (intervals.length < 3) return null

  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length
  if (mean <= 0) return null
  const variance =
    intervals.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0) / intervals.length
  const sd = Math.sqrt(variance)
  const cv = sd / mean
  const score = Math.max(0, Math.min(100, 100 - cv * 100))
  return Math.round(score)
}

export function useGame() {
  const { submitScore } = useScoreApi()

  const [screen, setScreen] = useState<Screen>("game")
  const [length, setLength] = useState<GameLength>(1)
  const [difficulty, setDifficulty] = useState<GameDifficulty>("easy")
  const [promptIndex, setPromptIndex] = useState<number>(() =>
    firstPromptIndex(1, "easy")
  )
  const prompt = useMemo(() => PROMPTS[promptIndex], [promptIndex])
  const target = useMemo(() => prompt.code, [prompt.code])

  const [typed, setTyped] = useState("")
  const [error, setError] = useState(false)

  const [startMs, setStartMs] = useState<number | null>(null)
  const [nowMs, setNowMs] = useState<number>(() => Date.now())
  const keystrokesRef = useRef<number[]>([])
  const startMsRef = useRef<number | null>(null)
  const firstRenderMsRef = useRef<number>(0)
  const prevTypedLenRef = useRef<number>(0)
  const backspacesRef = useRef<number>(0)

  const [score, setScore] = useState<ServerScoreResponse | null>(null)
  const [runStats, setRunStats] = useState<RunStats | null>(null)
  const [lastCorrect, setLastCorrect] = useState<number>(0)
  const [lastTotal, setLastTotal] = useState<number>(0)
  const [editorKey, setEditorKey] = useState<number>(0)

  const startGame = useCallback(() => {
    setScreen("game")
    setPromptIndex(randomPromptIndex(length, difficulty))
    setTyped("")
    setError(false)
    setStartMs(null)
    startMsRef.current = null
    setLastCorrect(0)
    setLastTotal(0)
    keystrokesRef.current = []
    prevTypedLenRef.current = 0
    backspacesRef.current = 0
    setScore(null)
    setRunStats(null)
    const now = Date.now()
    firstRenderMsRef.current = now
    setEditorKey((k) => k + 1)
  }, [difficulty, length])

  const setLengthAndRestart = useCallback(
    (next: GameLength) => {
      setLength(next)
      // restart immediately so prompt pool + editor are consistent
      setPromptIndex(randomPromptIndex(next, difficulty))
      setScreen("game")
      setTyped("")
      setError(false)
      setStartMs(null)
      startMsRef.current = null
      setLastCorrect(0)
      setLastTotal(0)
      keystrokesRef.current = []
      prevTypedLenRef.current = 0
      backspacesRef.current = 0
      setScore(null)
      setRunStats(null)
      const now = Date.now()
      firstRenderMsRef.current = now
      setEditorKey((k) => k + 1)
    },
    [difficulty]
  )

  const setDifficultyAndRestart = useCallback(
    (next: GameDifficulty) => {
      setDifficulty(next)
      setPromptIndex(randomPromptIndex(length, next))
      setScreen("game")
      setTyped("")
      setError(false)
      setStartMs(null)
      startMsRef.current = null
      setLastCorrect(0)
      setLastTotal(0)
      keystrokesRef.current = []
      prevTypedLenRef.current = 0
      backspacesRef.current = 0
      setScore(null)
      setRunStats(null)
      const now = Date.now()
      firstRenderMsRef.current = now
      setEditorKey((k) => k + 1)
    },
    [length]
  )

  const onProgress = useCallback(
    (info: EditorProgress) => {
      if (!startMsRef.current) {
        startMsRef.current = info.keystrokeTs
        setStartMs(info.keystrokeTs)
      }

      if (info.typed.length < prevTypedLenRef.current) {
        backspacesRef.current += prevTypedLenRef.current - info.typed.length
      }
      prevTypedLenRef.current = info.typed.length

      keystrokesRef.current.push(info.keystrokeTs)
      setTyped(info.typed)
      setError(info.error)
      setLastCorrect(info.correctCharacters)
      setLastTotal(info.totalTypedCharacters)

      if (info.typed.length === target.length) {
        const end = info.keystrokeTs
        const start = startMsRef.current ?? end
        const durationMs = Math.max(1, end - start)
        const timeToFirstKeyMs =
          startMsRef.current && firstRenderMsRef.current
            ? Math.max(0, startMsRef.current - firstRenderMsRef.current)
            : null

        const correctChars = info.correctCharacters
        const totalTypedChars = info.totalTypedCharacters
        const targetChars = target.length
        const mistakes = Math.max(0, totalTypedChars - correctChars)
        const accuracy = totalTypedChars > 0 ? correctChars / totalTypedChars : 0
        const rawWpm = totalTypedChars / 5 / (durationMs / 60000)
        const correctWpm = correctChars / 5 / (durationMs / 60000)

        setRunStats({
          durationMs,
          timeToFirstKeyMs,
          targetChars,
          correctChars,
          totalTypedChars,
          mistakes,
          backspaces: backspacesRef.current,
          rawWpm,
          correctWpm,
          accuracy,
          consistency: computeConsistency(keystrokesRef.current),
        })
        setScreen("results")

        const result: GameResult = {
          correctCharacters: info.correctCharacters,
          totalTypedCharacters: info.totalTypedCharacters,
          timeMs: durationMs,
        }

        void (async () => {
          const data = await submitScore(result)
          setScore(data)
        })()
      }
    },
    [submitScore, target.length]
  )

  useEffect(() => {
    // Avoid impure `Date.now()` during render; initialize after mount.
    if (firstRenderMsRef.current === 0) firstRenderMsRef.current = Date.now()

    if (screen !== "game") return
    const id = setInterval(() => setNowMs(Date.now()), 100)
    return () => clearInterval(id)
  }, [screen])

  const liveTimeMs = startMs ? nowMs - startMs : 0
  const liveCwpm = startMs ? lastCorrect / 5 / (Math.max(1, liveTimeMs) / 60000) : 0
  const liveAcc = lastTotal > 0 ? lastCorrect / lastTotal : 0

  const headerWpm =
    screen === "results"
      ? Math.floor(score?.cWPM ?? runStats?.correctWpm ?? 0)
      : Math.floor(liveCwpm)
  const headerAcc =
    screen === "results"
      ? Math.floor((score?.accuracy ?? 0) * 100)
      : Math.floor(liveAcc * 100)

  const progressLeft = `${typed.length} / ${target.length}`

  return {
    LENGTHS,
    DIFFICULTIES,
    screen,
    prompt,
    target,
    typed,
    error,
    score,
    runStats,
    liveTimeMs,
    progressLeft,
    headerWpm,
    headerAcc,
    length,
    setLength: setLengthAndRestart,
    difficulty,
    setDifficulty: setDifficultyAndRestart,
    onProgress,
    redo: startGame,
    editorKey,
  }
}
