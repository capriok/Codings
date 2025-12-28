"use client"

import { Button } from "@/components/ui/button"
import type { GameLength } from "@/lib/hooks/use-game"
import { cn, formatCodeLines, formatDifficulty } from "@/lib/utils"
import type { GameDifficulty } from "@/lib/hooks/use-game"
import Tip from "@/components/tip"

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
        <Tip align="center" side="bottom" tip="Type code snippets as fast as you can">
          <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
            codings<span className="text-primary">_</span>
          </h1>
        </Tip>
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
    <div className="flex items-center gap-1">
      {options.map((c) => (
        <Tip tip={formatCodeLines(c)} key={c}>
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
          >
            {c}
          </Button>
        </Tip>
      ))}
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
    <div className="flex items-center gap-1">
      {options.map((d) => (
        <Tip tip={`${formatDifficulty(d)} difficulty`} key={d}>
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
          >
            {d}
          </Button>
        </Tip>
      ))}
    </div>
  )
}
