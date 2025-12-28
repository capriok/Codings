"use client"

import { Button } from "@/components/ui/button"
import type { GameLength, GameDifficulty, GameScoringMode } from "@/lib/hooks/use-game"
import { cn } from "@/lib/utils"
import Tip from "@/components/tip"
import { KDBGameControl } from "@/lib/hooks/use-game-controls"
import { SquareActivityIcon, SquareEqualIcon } from "lucide-react"

export default function GameHeader({
  lengths,
  length,
  onLengthChange,
  difficulties,
  difficulty,
  onDifficultyChange,
  scoringModes,
  scoringMode,
  onScoringModeChange,
}: {
  lengths: readonly GameLength[]
  length: GameLength
  onLengthChange: (len: GameLength) => void
  difficulties: readonly GameDifficulty[]
  difficulty: GameDifficulty
  onDifficultyChange: (d: GameDifficulty) => void
  scoringModes: readonly GameScoringMode[]
  scoringMode: GameScoringMode
  onScoringModeChange: (mode: GameScoringMode) => void
}) {
  return (
    <header className="w-full select-none">
      <div className="flex items-end justify-between mb-4 font-mono text-sm">
        <div className="flex items-center gap-6">
          <CodeLineSelections options={lengths} value={length} onChange={onLengthChange} />
          <DifficultySelections
            options={difficulties}
            value={difficulty}
            onChange={onDifficultyChange}
          />
        </div>
        <ScoringModeToggle
          options={scoringModes}
          value={scoringMode}
          onChange={onScoringModeChange}
        />
      </div>
    </header>
  )
}

function CodeLineSelections({
  options,
  value,
  onChange,
}: {
  options: readonly GameLength[]
  value: GameLength
  onChange: (next: GameLength) => void
}) {
  return (
    <Tip
      align="start"
      tip={
        <div className="flex items-center gap-2">
          <span className="text-xs">Lines</span>
          <KDBGameControl type="cycle-length" />
        </div>
      }
    >
      <div className="flex items-center gap-1">
        {options.map((c) => (
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-7 w-7 p-0 font-mono text-sm transition-colors",
              c === value
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground/60 hover:text-foreground"
            )}
            onClick={() => onChange(c)}
            key={c}
          >
            {c}
          </Button>
        ))}
      </div>
    </Tip>
  )
}

function DifficultySelections({
  options,
  value,
  onChange,
}: {
  options: readonly GameDifficulty[]
  value: GameDifficulty
  onChange: (next: GameDifficulty) => void
}) {
  return (
    <Tip
      align="start"
      tip={
        <div className="flex items-center gap-2">
          <span className="text-xs">Difficulty</span>
          <KDBGameControl type="cycle-difficulty" />
        </div>
      }
    >
      <div className="flex items-center gap-1">
        {options.map((d) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 py-0 font-mono text-sm transition-colors",
              d === value
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground/60 hover:text-foreground"
            )}
            onClick={() => onChange(d)}
            key={d}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </Button>
        ))}
      </div>
    </Tip>
  )
}

function ScoringModeToggle({
  options,
  value,
  onChange,
}: {
  options: readonly GameScoringMode[]
  value: GameScoringMode
  onChange: (next: GameScoringMode) => void
}) {
  const labels: Record<GameScoringMode, React.ReactNode> = {
    simple: <SquareEqualIcon size={16}/>,
    tuned: <SquareActivityIcon size={16}/>,
  }

  const tips: Record<GameScoringMode, string> = {
    simple: "WPM × accuracy only",
    tuned: "Difficulty + consistency bonuses",
  }

  return (
    <div className="flex items-center rounded-md border border-border/40 h-[28px] bg-muted/30 p-0.5">
      {options.map((mode) => (
        <Tip key={mode} tip={tips[mode]} align="start">
          <button
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              "px-2.5 py-1 cursor-pointer font-mono text-xs rounded transition-all",
              mode === value
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground/60 hover:text-foreground"
            )}
          >
            {labels[mode]}
          </button>
        </Tip>
      ))}
    </div>
  )
}
