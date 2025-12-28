"use client"

import GameHeader from "@/app/(game)/game-header"
import GameSession from "@/app/(game)/game-session"
import { useGame } from "@/lib/hooks/use-game"
import { useGameControls } from "@/lib/hooks/use-game-controls"

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
    newSnippet,
    editorKey,
  } = useGame()

  useGameControls({
    lengths: LENGTHS,
    length,
    setLength,
    difficulties: DIFFICULTIES,
    difficulty,
    setDifficulty,
    newSnippet,
    enableEnterShortcut: screen === "results",
  })

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
        onNewSnippet={newSnippet}
      />

      <div className="pb-10" />
    </div>
  )
}
