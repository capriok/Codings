"use client"

import { motion } from "motion/react"
import { SpaceIcon } from "lucide-react"
import Tip from "@/components/ui/tip"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AnimatedStatCard, AnimatedStat, AnimatedScore } from "@/components/animated-stat"
import TypewriterCode from "@/components/typewriter-code"
import { KDBGameControl } from "@/lib/hooks/use-game-controls"
import { formatDifficulty } from "@/lib/utils"
import type { Prompt, RunStats, ServerScoreResponse } from "@/lib/types"

// Animation timing constants (in ms)
const TIMING = {
  headerDelay: 0,
  codeDelay: 150,
  wpmDelay: 400,
  accuracyDelay: 550,
  timeDelay: 700,
  secondaryStatsDelay: 850,
  scoreDelay: 1050,
  statDuration: 800,
  scoreDuration: 1000,
  codeSpeed: 100, // chars per second
}

export default function GameResults({
  prompt,
  target,
  score,
  runStats,
  onNewSnippet,
}: {
  prompt: Prompt
  target: string
  score: ServerScoreResponse | null
  runStats: RunStats | null
  onNewSnippet: () => void
}) {
  const resultsCorrectWpm = score?.cWPM ?? runStats?.correctWpm ?? 0
  const resultsAccuracy = score?.accuracy ?? runStats?.accuracy ?? 0
  const resultsTimeSec = (runStats?.durationMs ?? 0) / 1000
  const resultsScore = score?.score ?? 0

  return (
    <section className="w-full select-none">
      <div className="flex flex-col gap-4">
        {/* Header with badges and redo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: TIMING.headerDelay / 1000 }}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Tip tip="Number of lines in snippet" align="start">
              <Badge variant="default-outline" className="font-mono text-xs">
                {prompt.lines} {prompt.lines === 1 ? "Line" : "Lines"}
              </Badge>
            </Tip>
            <Tip tip="Programming language" align="start">
              <Badge variant="default-outline" className="font-mono text-xs">
                {prompt.language.toUpperCase()}
              </Badge>
            </Tip>
            <Tip tip="Snippet difficulty" align="start">
              <Badge variant="default-outline" className="font-mono text-xs capitalize">
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
            Again
            <KDBGameControl flat type="next-game" />
          </Button>
        </motion.div>
        
        {/* Code snippet with typewriter effect */}
        <TypewriterCode
          code={target}
          startDelay={TIMING.codeDelay}
          speed={TIMING.codeSpeed}
        />

        {/* Main stats with staggered count-up */}
        <div className="grid grid-cols-3 gap-3">
          <AnimatedStatCard
            label="WPM"
            value={resultsCorrectWpm}
            format={(v) => v.toFixed(0)}
            tip="Words per minute (correct chars / 5 / min)"
            accent
            delay={TIMING.wpmDelay}
            duration={TIMING.statDuration}
          />
          <AnimatedStatCard
            label="Accuracy"
            value={resultsAccuracy * 100}
            format={(v) => `${v.toFixed(0)}%`}
            tip="Correct characters / total typed"
            accent
            delay={TIMING.accuracyDelay}
            duration={TIMING.statDuration}
          />
          <AnimatedStatCard
            label="Time"
            value={resultsTimeSec}
            format={(v) => `${v.toFixed(2)}s`}
            tip="Time from first to last keystroke"
            accent
            delay={TIMING.timeDelay}
            duration={TIMING.statDuration}
          />
        </div>

        {/* Secondary stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: TIMING.secondaryStatsDelay / 1000 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          <AnimatedStat
            label="Consistency"
            value={runStats?.consistency != null ? runStats.consistency : "—"}
            format={(v) => `${v.toFixed(0)}%`}
            tip="Typing rhythm score"
            delay={TIMING.secondaryStatsDelay}
          />
          <AnimatedStat
            label="Mistakes"
            value={runStats?.mistakes ?? 0}
            format={(v) => v.toFixed(0)}
            tip="Wrong keystrokes"
            delay={TIMING.secondaryStatsDelay + 50}
          />
          <AnimatedStat
            label="Backspaces"
            value={runStats?.backspaces ?? 0}
            format={(v) => v.toFixed(0)}
            tip="Times you pressed backspace"
            delay={TIMING.secondaryStatsDelay + 100}
          />
          <Tip tip="Top keys you struggled with" align="start">
            <div className="flex items-center justify-between rounded-lg bg-card px-3 py-2">
              <span className="font-mono text-xs text-muted-foreground/70">Problem Keys</span>
              <div className="font-mono text-sm font-medium text-foreground/80 flex gap-1">
                {runStats?.problemKeys && runStats.problemKeys.length > 0
                  ? runStats.problemKeys.map((k) => (
                      <code key={k} className="bg-muted size-6 rounded inline-flex items-center justify-center">
                        {k === "\n" ? "↵" : k === " " ? <SpaceIcon className="size-3" /> : k.toUpperCase()}
                      </code>
                    ))
                  : <span>—</span>}
              </div>
            </div>
          </Tip>
          <AnimatedStat
            label="Longest Pause"
            value={runStats?.longestPauseMs != null ? runStats.longestPauseMs / 1000 : "—"}
            format={(v) => `${v.toFixed(2)}s`}
            tip="Longest gap between keystrokes"
            delay={TIMING.secondaryStatsDelay + 150}
          />
          <AnimatedStat
            label="Correction Time"
            value={runStats?.avgCorrectionLatencyMs != null ? runStats.avgCorrectionLatencyMs / 1000 : "—"}
            format={(v) => `${v.toFixed(2)}s`}
            tip="Average time to press backspace after error"
            delay={TIMING.secondaryStatsDelay + 200}
          />
        </motion.div>

        {/* Score footer */}
        <AnimatedScore
          score={resultsScore}
          delay={TIMING.scoreDelay}
          duration={TIMING.scoreDuration}
        />
      </div>
    </section>
  )
}
