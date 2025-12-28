"use client"

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

  return (
    <div className="flex  max-w-[800px] w-full flex-col">
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
