"use client"

import { useMemo } from "react"
import { motion } from "motion/react"
import Tip from "@/components/tip"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AnimatedStatCard, AnimatedStat, AnimatedScore } from "@/components/animated-stat"
import TypewriterCode from "@/components/typewriter-code"
import { KDBGameControl } from "@/lib/hooks/use-game-controls"
import { formatDifficulty } from "@/lib/utils"
import type { Prompt, RunStats, ServerScoreResponse } from "@/lib/types"

// Animation timing constants (in ms)
const TIMING = {
  headerDelay: 0,
  wpmDelay: 100,
  accuracyDelay: 250,
  timeDelay: 400,
  secondaryStatsDelay: 550,
  scoreDelay: 750,
  codeDelay: 1100,
  statDuration: 800,
  scoreDuration: 1000,
  codeSpeed: 80, // chars per second
}

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

  // Parse progress for animation
  const [correctChars, targetChars] = useMemo(() => {
    if (runStats != null) {
      return [runStats.correctChars, runStats.targetChars]
    }
    const parts = progressLeft.split(" / ")
    return [parseInt(parts[0]) || 0, parseInt(parts[1]) || 0]
  }, [runStats, progressLeft])

  return (
    <section className="mt-10 w-full select-none">
      <div className="flex flex-col gap-6">
        {/* Header with badges and redo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: TIMING.headerDelay / 1000 }}
          className="flex flex-wrap items-center justify-between gap-3"
        >
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
        </motion.div>

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

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.4, delay: TIMING.secondaryStatsDelay / 1000 }}
        >
          <Separator className="opacity-30" />
        </motion.div>

        {/* Secondary stats */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <AnimatedStat
            label="Raw WPM"
            value={runStats?.rawWpm ?? 0}
            format={(v) => v.toFixed(1)}
            tip="All typed chars / 5 / min"
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
          <AnimatedStat
            label="Consistency"
            value={runStats?.consistency != null ? runStats.consistency : "—"}
            format={(v) => `${v.toFixed(0)}%`}
            tip="Typing rhythm score"
            delay={TIMING.secondaryStatsDelay + 150}
          />
          <AnimatedStat
            label="First key"
            value={runStats?.timeToFirstKeyMs != null ? runStats.timeToFirstKeyMs : "—"}
            format={(v) => `${v.toFixed(0)}ms`}
            tip="Time until first keystroke"
            delay={TIMING.secondaryStatsDelay + 200}
          />
          <AnimatedStat
            label="Chars"
            value={correctChars}
            format={(v) => `${v.toFixed(0)} / ${targetChars}`}
            tip="Correct / target characters"
            delay={TIMING.secondaryStatsDelay + 250}
          />
        </div>

        {/* Score footer */}
        <AnimatedScore
          score={resultsScore}
          delay={TIMING.scoreDelay}
          duration={TIMING.scoreDuration}
        />

        {/* Code snippet with typewriter effect */}
        <TypewriterCode
          code={target}
          startDelay={TIMING.codeDelay}
          speed={TIMING.codeSpeed}
        />
      </div>
    </section>
  )
}
