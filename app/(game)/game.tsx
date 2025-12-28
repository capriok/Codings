"use client"

import { useCallback, useEffect } from "react"
import GameHeader from "@/app/(game)/game-header"
import GameSession from "@/app/(game)/game-session"
import { useGame } from "@/lib/hooks/use-game"

export default function Game() {
  const {
    LENGTHS,
    DIFFICULTIES,
    screen,
    prompt,
    target,
    score,
    runStats,
    liveTimeMs,
    progressLeft,
    length,
    setLength,
    difficulty,
    setDifficulty,
    onProgress,
    redo,
    editorKey,
  } = useGame()

  const cycleLength = useCallback(() => {
    const currentIndex = LENGTHS.indexOf(length)
    const nextIndex = (currentIndex + 1) % LENGTHS.length
    setLength(LENGTHS[nextIndex])
  }, [LENGTHS, length, setLength])

  const cycleDifficulty = useCallback(() => {
    const currentIndex = DIFFICULTIES.indexOf(difficulty)
    const nextIndex = (currentIndex + 1) % DIFFICULTIES.length
    setDifficulty(DIFFICULTIES[nextIndex])
  }, [DIFFICULTIES, difficulty, setDifficulty])

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Only trigger with Ctrl/Cmd
      if (!e.ctrlKey && !e.metaKey) return

      switch (e.key) {
        case "r":
        case "R":
          e.preventDefault()
          redo()
          break
        case "l":
        case "L":
          e.preventDefault()
          cycleLength()
          break
        case "d":
        case "D":
          e.preventDefault()
          cycleDifficulty()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [redo, cycleLength, cycleDifficulty])

  return (
    <div className="flex max-w-[800px] w-full flex-col">
      <GameHeader
        lengths={LENGTHS}
        length={length}
        onLengthChange={setLength}
        difficulties={DIFFICULTIES}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
      />

      <GameSession
        screen={screen}
        prompt={prompt}
        target={target}
        liveTimeMs={liveTimeMs}
        progressLeft={progressLeft}
        score={score}
        runStats={runStats}
        editorKey={editorKey}
        length={length}
        onProgress={onProgress}
        onRedo={redo}
      />

      <div className="pb-10" />
    </div>
  )
}
