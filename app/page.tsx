"use client"

import GameHeader from "@/app/(game)/game-header"
import GameLayout, { GameTitle } from "@/app/(game)/game-layout"
import GameResults from "@/app/(game)/game-results"
import GameSession from "@/app/(game)/game-session"
import { useGame } from "@/lib/hooks/use-game"
import { useGameControls } from "@/lib/hooks/use-game-controls"

export default function Page() {
  const {
    LENGTHS,
    DIFFICULTIES,
    SCORING_MODES,
    screen,
    prompt,
    target,
    score,
    runStats,
    length,
    setLength,
    difficulty,
    setDifficulty,
    scoringMode,
    setScoringMode,
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
    <GameLayout>
      <GameTitle />

      <GameHeader
        lengths={LENGTHS}
        length={length}
        onLengthChange={setLength}
        difficulties={DIFFICULTIES}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        scoringModes={SCORING_MODES}
        scoringMode={scoringMode}
        onScoringModeChange={setScoringMode}
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

      {screen === "results" && (
        <GameResults
          prompt={prompt}
          target={target}
          score={score}
          runStats={runStats}
          scoringMode={scoringMode}
          onNewSnippet={newSnippet}
        />
      )}
    </GameLayout>
  )
}
