"use client"

import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import type { GameLength } from "@/lib/hooks/use-game"
import { cn, formatCodeLines, formatDifficulty } from "@/lib/utils"
import type { GameDifficulty } from "@/lib/hooks/use-game"
import Tip from "@/components/tip"
import { useModKey } from "@/lib/hooks/use-mod-key"

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
  const mod = useModKey()

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
                    <Kbd>
                      <span className="text-[10px]">{mod}</span>
                      <span className="text-xs">R</span>
                    </Kbd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs">Cycle lines</span>
                    <Kbd>
                      <span className="text-[10px]">{mod}</span>
                      <span className="text-xs">L</span>
                    </Kbd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs">Cycle difficulty</span>
                    <Kbd>
                      <span className="text-[10px]">{mod}</span>
                      <span className="text-xs">D</span>
                    </Kbd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs">Next (results)</span>
                    <Kbd>
                      <span className="text-[10px]">{mod}</span>
                      <span className="text-base">↵</span>
                    </Kbd>
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
        <CodeLineSelections
          options={lengths}
          value={length}
          onChange={onLengthChange}
          mod={mod}
        />
        <DifficultySelections
          options={difficulties}
          value={difficulty}
          onChange={onDifficultyChange}
          mod={mod}
        />
      </div>
    </header>
  )
}

function CodeLineSelections({
  options,
  value,
  onChange,
  mod,
}: {
  options: readonly GameLength[]
  value: GameLength
  onChange: (next: GameLength) => void
  mod: string
}) {
  return (
    <div className="flex items-center gap-1">
      {options.map((c) => (
        <Tip
          tip={
            <span className="flex items-center gap-2">
              <span className="font-medium">{formatCodeLines(c)}</span>
              <Kbd>
                <span className="text-[10px]">{mod}</span>
                <span className="text-xs">L</span>
              </Kbd>
            </span>
          }
          key={c}
        >
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
  mod,
}: {
  options: readonly GameDifficulty[]
  value: GameDifficulty
  onChange: (next: GameDifficulty) => void
  mod: string
}) {
  return (
    <div className="flex items-center gap-1">
      {options.map((d) => (
        <Tip
          tip={
            <span className="flex items-center gap-2">
              <span className="font-medium">{formatDifficulty(d)}</span>
              <Kbd>
                <span className="text-[10px]">{mod}</span>
                <span className="text-xs">D</span>
              </Kbd>
            </span>
          }
          key={d}
        >
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
