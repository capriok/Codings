"use client"

import { useMemo } from "react"
import Tip from "@/components/tip"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { KDBGameControl } from "@/lib/hooks/use-game-controls"
import { formatDifficulty } from "@/lib/utils"
import type { Prompt, RunStats, ServerScoreResponse } from "@/lib/types"

export default function GameResults({
  prompt,
  target,
  progressLeft,
  score,
  runStats,
  onNewSnippet,
}: {
  prompt: Prompt
  target: string
  progressLeft: string
  score: ServerScoreResponse | null
  runStats: RunStats | null
  onNewSnippet: () => void
}) {
  const resultsCorrectWpm = score?.cWPM ?? runStats?.correctWpm ?? 0
  const resultsAccuracy = score?.accuracy ?? runStats?.accuracy ?? 0
  const resultsTimeSec = (runStats?.durationMs ?? 0) / 1000
  const resultsScore = score?.score ?? 0
  const resultsRun =
    runStats != null ? `${runStats.correctChars} / ${runStats.targetChars}` : progressLeft

  // Memoize target lines to avoid split on every render
  const targetLines = useMemo(() => target.split("\n"), [target])

  return (
    <section className="mt-10 w-full select-none">
      <div className="flex flex-col gap-6">
        {/* Header with badges and redo */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Tip tip="Number of lines in snippet" align="start">
              <Badge variant="secondary" className="font-mono text-xs">
                {prompt.lines} {prompt.lines === 1 ? "Line" : "Lines"}
              </Badge>
            </Tip>
            <Tip tip="Programming language" align="start">
              <Badge variant="outline" className="font-mono text-xs">
                {prompt.language.toUpperCase()}
              </Badge>
            </Tip>
            <Tip tip="Snippet difficulty" align="start">
              <Badge variant="outline" className="font-mono text-xs capitalize">
                {formatDifficulty(prompt.difficulty)}
              </Badge>
            </Tip>
          </div>
          <Button
            type="button"
            onClick={onNewSnippet}
            variant="secondary"
            size="sm"
            className="group font-mono text-xs gap-1.5"
          >
            Next
            <KDBGameControl type="next-game" />
          </Button>
        </div>

        {/* Main stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="WPM"
            value={resultsCorrectWpm.toFixed(0)}
            tip="Words per minute (correct chars / 5 / min)"
            accent
          />
          <StatCard
            label="Accuracy"
            value={`${(resultsAccuracy * 100).toFixed(0)}%`}
            tip="Correct characters / total typed"
            accent
          />
          <StatCard
            label="Time"
            value={`${resultsTimeSec.toFixed(2)}s`}
            tip="Time from first to last keystroke"
            accent
          />
        </div>

        <Separator className="opacity-30" />

        {/* Secondary stats */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Stat
            label="Raw WPM"
            value={(runStats?.rawWpm ?? 0).toFixed(1)}
            tip="All typed chars / 5 / min"
          />
          <Stat
            label="Mistakes"
            value={`${runStats?.mistakes ?? 0}`}
            tip="Wrong keystrokes"
          />
          <Stat
            label="Backspaces"
            value={`${runStats?.backspaces ?? 0}`}
            tip="Times you pressed backspace"
          />
          <Stat
            label="Consistency"
            value={runStats?.consistency != null ? `${runStats.consistency}%` : "—"}
            tip="Typing rhythm score"
          />
          <Stat
            label="First key"
            value={
              runStats?.timeToFirstKeyMs != null
                ? `${runStats.timeToFirstKeyMs}ms`
                : "—"
            }
            tip="Time until first keystroke"
          />
          <Stat label="Chars" value={resultsRun} tip="Correct / target characters" />
        </div>

        {/* Score footer */}
        <Tip tip="Combined score based on WPM and accuracy">
          <div className="rounded-lg bg-primary/10 px-4 py-3 text-center">
            <span className="font-mono text-2xl font-bold text-primary">
              {resultsScore.toFixed(0)}
            </span>
            <span className="ml-2 font-mono text-xs text-muted-foreground">score</span>
          </div>
        </Tip>

        {/* Code snippet display */}
        <div className="flex rounded-lg cursor-default select-none border border-border/40 bg-muted/50 font-mono text-sm leading-relaxed text-foreground/90 overflow-hidden">
          {/* Line numbers gutter */}
          <div
            className="shrink-0 border-r border-border/30 bg-muted/70 px-3 py-4 text-right text-muted-foreground/40"
            aria-hidden="true"
          >
            {targetLines.map((_, i) => (
              <div key={i} className="leading-relaxed">
                {i + 1}
              </div>
            ))}
          </div>
          {/* Code content */}
          <pre className="flex-1 whitespace-pre-wrap p-4 m-0">{target}</pre>
        </div>
      </div>
    </section>
  )
}

function StatCard({
  label,
  value,
  tip,
  accent,
}: {
  label: string
  value: string
  tip?: string
  accent?: boolean
}) {
  const content = (
    <div className="rounded-xl border border-border/30 bg-muted/40 p-4 text-center">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
        {label}
      </div>
      <div
        className={`mt-1 font-mono text-2xl font-bold ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  )
  return tip ? <Tip tip={tip}>{content}</Tip> : content
}

function Stat({ label, value, tip }: { label: string; value: string; tip?: string }) {
  const content = (
    <div className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
      <span className="font-mono text-xs text-muted-foreground/70">{label}</span>
      <span className="font-mono text-sm font-medium text-foreground/80">{value}</span>
    </div>
  )
  return tip ? <Tip tip={tip}>{content}</Tip> : content
}

