"use client"

import GameHeader from "@/app/(game)/game-header"
import GameLayout, { GameTitle } from "@/app/(game)/game-layout"
import GameSession from "@/app/(game)/game-session"
import { Spinner } from "@/components/spinner"
import { useGame } from "@/lib/hooks/use-game"
import { useGameControls } from "@/lib/hooks/use-game-controls"

export default function Page() {
  const {
    LENGTHS,
    DIFFICULTIES,
    screen,
    prompt,
    target,
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
    enableEnterShortcut: false,
  })

  return (
    <GameLayout>
      <GameTitle />

      <GameHeader
        lengths={LENGTHS}
        length={length}
        onLengthChange={setLength}
        difficulties={DIFFICULTIES}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
      />

      {screen === "game" && (
        <GameSession
          prompt={prompt}
          target={target}
          editorKey={editorKey}
          length={length}
          onProgress={onProgress}
          onNewSnippet={newSnippet}
        />
      )}

      {screen === "encoding" && (
        <div className="flex min-h-[54px] w-full items-center justify-center">
          <Spinner />
        </div>
      )}
    </GameLayout>
  )
}
