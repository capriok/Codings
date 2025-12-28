"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { computeRunStats } from "@/lib/game/stats"
import {
  getPrompt,
  findFirstPromptIndex,
  pickRandomPromptIndex,
} from "@/lib/game/prompts"
import { createSessionRefs, resetSessionRefs } from "@/lib/game/session"
import { useScoreApi } from "@/lib/hooks/use-score-api"
import { encodeResult } from "@/lib/result-codec"
import { useResultHistory } from "@/lib/hooks/use-result-history"
import type {
  Difficulty,
  EditorProgress,
  PromptLines,
  GameResult,
  RunStats,
  Screen,
  ScoringMode,
  ServerScoreResponse,
} from "@/lib/types"

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const LENGTHS = [1, 2, 3] as const satisfies readonly PromptLines[]
export type GameLength = (typeof LENGTHS)[number]

const DIFFICULTIES = ["easy", "medium", "hard"] as const satisfies readonly Difficulty[]
export type GameDifficulty = (typeof DIFFICULTIES)[number]

const SCORING_MODES = ["simple", "tuned"] as const satisfies readonly ScoringMode[]
export type GameScoringMode = (typeof SCORING_MODES)[number]

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useGame() {
  const router = useRouter()
  const { submitScore } = useScoreApi()
  const { addResult } = useResultHistory()

  // ─── Settings ────────────────────────────────────────────────────────────
  const [length, setLengthState] = useState<GameLength>(1)
  const [difficulty, setDifficultyState] = useState<GameDifficulty>("easy")
  const [scoringMode, setScoringMode] = useState<GameScoringMode>("tuned")

  // ─── Prompt ──────────────────────────────────────────────────────────────
  const [promptIndex, setPromptIndex] = useState(() => findFirstPromptIndex(1, "easy"))
  const prompt = useMemo(() => getPrompt(promptIndex), [promptIndex])
  const target = prompt.code

  // ─── Screen & UI State ───────────────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>("game")
  const [editorKey, setEditorKey] = useState(0)

  // ─── Live Typing State ───────────────────────────────────────────────────
  const [typed, setTyped] = useState("")
  const [error, setError] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(0)
  const [lastTotal, setLastTotal] = useState(0)

  // ─── Timing ──────────────────────────────────────────────────────────────
  const [startMs, setStartMs] = useState<number | null>(null)
  const [nowMs, setNowMs] = useState(() => Date.now())

  // ─── Results ─────────────────────────────────────────────────────────────
  const [score, setScore] = useState<ServerScoreResponse | null>(null)
  const [runStats, setRunStats] = useState<RunStats | null>(null)

  // ─── Session Refs (mutable, no re-renders) ───────────────────────────────
  const sessionRef = useRef(createSessionRefs())

  // ─── Reset Helper ────────────────────────────────────────────────────────
  const resetGame = useCallback(
    (newLength: GameLength, newDifficulty: GameDifficulty) => {
      // Reset session tracking
      resetSessionRefs(sessionRef.current)

      // Reset React state
      setScreen("game")
      setPromptIndex(pickRandomPromptIndex(newLength, newDifficulty))
      setTyped("")
      setError(false)
      setStartMs(null)
      setLastCorrect(0)
      setLastTotal(0)
      setScore(null)
      setRunStats(null)
      setEditorKey((k) => k + 1)
    },
    []
  )

  // ─── Public Actions ──────────────────────────────────────────────────────
  const newSnippet = useCallback(() => {
    resetGame(length, difficulty)
  }, [resetGame, length, difficulty])

  const setLength = useCallback(
    (next: GameLength) => {
      setLengthState(next)
      resetGame(next, difficulty)
    },
    [resetGame, difficulty]
  )

  const setDifficulty = useCallback(
    (next: GameDifficulty) => {
      setDifficultyState(next)
      resetGame(length, next)
    },
    [resetGame, length]
  )

  // ─── Progress Handler ────────────────────────────────────────────────────
  const onProgress = useCallback(
    (info: EditorProgress) => {
      const session = sessionRef.current

      // Track first keystroke
      if (!session.startMs) {
        session.startMs = info.keystrokeTs
        setStartMs(info.keystrokeTs)
      }

      // Record progress keystroke (only forward progress, for pause tracking)
      // Must check before prevTypedLen is updated
      const isForwardProgress = !info.error && info.typed.length > session.prevTypedLen
      if (isForwardProgress) {
        session.progressKeystrokes.push(info.keystrokeTs)
      }

      // Track backspaces and correction latency
      if (info.typed.length < session.prevTypedLen) {
        session.backspaces += session.prevTypedLen - info.typed.length
      }
      // Track error recovery (backspace after error)
      if (info.isErrorRecovery && session.errorTs !== null) {
        const latency = info.keystrokeTs - session.errorTs
        session.correctionLatencies.push(latency)
        session.errorTs = null
      }
      session.prevTypedLen = info.typed.length

      // Track problem keys (record expected char when error occurs)
      if (info.error && info.expectedChar) {
        const count = session.problemKeyErrors.get(info.expectedChar) ?? 0
        session.problemKeyErrors.set(info.expectedChar, count + 1)
        session.errorTs = info.keystrokeTs
      }

      // Record keystroke (all keystrokes for consistency)
      session.keystrokes.push(info.keystrokeTs)

      // Update React state
      setTyped(info.typed)
      setError(info.error)
      setLastCorrect(info.correctCharacters)
      setLastTotal(info.totalTypedCharacters)

      // ─── Completion ────────────────────────────────────────────────────
      if (info.typed.length === target.length) {
        const endMs = info.keystrokeTs
        const durationMs = Math.max(1, endMs - (session.startMs ?? endMs))
        const timeToFirstKeyMs = session.startMs
          ? Math.max(0, session.startMs - session.firstRenderMs)
          : null

        const stats = computeRunStats({
          correctChars: info.correctCharacters,
          totalTypedChars: info.totalTypedCharacters,
          targetChars: target.length,
          durationMs,
          backspaces: session.backspaces,
          keystrokes: session.keystrokes,
          progressKeystrokes: session.progressKeystrokes,
          timeToFirstKeyMs,
          problemKeyErrors: session.problemKeyErrors,
          correctionLatencies: session.correctionLatencies,
        })

        setRunStats(stats)
        setScreen("results")

        // Submit score with extended fields
        const result: GameResult = {
          correctCharacters: info.correctCharacters,
          totalTypedCharacters: info.totalTypedCharacters,
          timeMs: durationMs,
          difficulty,
          targetChars: target.length,
          consistency: stats.consistency,
          scoringMode,
        }

        void submitScore(result).then((serverScore) => {
          setScore(serverScore)
          // Encode result and navigate to shareable URL
          const encoded = encodeResult(prompt, stats, serverScore, scoringMode)
          addResult(encoded)
          router.push(`/${encoded}`)
        })
      }
    },
    [target.length, submitScore, difficulty, scoringMode, prompt, addResult, router]
  )

  // ─── Timer Effect ────────────────────────────────────────────────────────
  // Only run timer when actively typing (startMs is set)
  useEffect(() => {
    if (screen !== "game" || !startMs) return
    const id = setInterval(() => setNowMs(Date.now()), 100)
    return () => clearInterval(id)
  }, [screen, startMs])

  // ─── Derived Values ──────────────────────────────────────────────────────
  const liveTimeMs = startMs ? nowMs - startMs : 0
  const progressLeft = `${typed.length} / ${target.length}`

  // ─── Return ──────────────────────────────────────────────────────────────
  return {
    // Constants
    LENGTHS,
    DIFFICULTIES,
    SCORING_MODES,

    // State
    screen,
    prompt,
    target,
    typed,
    error,
    score,
    runStats,
    liveTimeMs,
    progressLeft,
    editorKey,

    // Settings
    length,
    setLength,
    difficulty,
    setDifficulty,
    scoringMode,
    setScoringMode,

    // Actions
    onProgress,
    newSnippet,
  }
}
