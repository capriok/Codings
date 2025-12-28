"use client"

import { Button } from "@/components/ui/button"
import type { GameLength } from "@/lib/hooks/use-game"
import { cn } from "@/lib/utils"
import type { GameDifficulty } from "@/lib/hooks/use-game"
import Tip from "@/components/tip"
import { KDBGameControl } from "@/lib/hooks/use-game-controls"

export default function GameHeader({
  lengths,
  length,
  onLengthChange,
  difficulties,
  difficulty,
  onDifficultyChange,
}: {
  lengths: readonly GameLength[]
  length: GameLength
  onLengthChange: (len: GameLength) => void
  difficulties: readonly GameDifficulty[]
  difficulty: GameDifficulty
  onDifficultyChange: (d: GameDifficulty) => void
}) {
  return (
    <header className="w-full select-none">
      <div className="pt-12 text-center">
        <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
          <Tip
            align="center"
            side="bottom"
            tip={
              <div className="flex flex-col gap-3 py-1">
                <p className="text-sm">Type code snippets as fast as you can</p>
                <div className="flex flex-col gap-1.5 border-t border-border/50 pt-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs">New snippet</span>
                    <KDBGameControl type="new-snippet" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs">Cycle lines</span>
                    <KDBGameControl type="cycle-length" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs">Cycle difficulty</span>
                    <KDBGameControl type="cycle-difficulty" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs">Next (results)</span>
                    <KDBGameControl type="next-game" />
                  </div>
                </div>
              </div>
            }
          >
            <span>
              codings<span className="text-primary">_</span>
            </span>
          </Tip>
        </h1>
      </div>

      <div className="mt-10 flex items-center gap-6 border-b border-border/40 pb-3 font-mono text-sm">
        <CodeLineSelections options={lengths} value={length} onChange={onLengthChange} />
        <DifficultySelections
          options={difficulties}
          value={difficulty}
          onChange={onDifficultyChange}
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
    <div className="group flex flex-col gap-1.5">
      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="text-xs text-muted-foreground">Lines</span>
        <KDBGameControl type="cycle-length" />
      </div>
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
    </div>
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
    <div className="group flex flex-col gap-1.5">
      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="text-xs text-muted-foreground">Difficulty</span>
        <KDBGameControl type="cycle-difficulty" />
      </div>
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
    </div>
  )
}
