"use client"

import { use, useEffect, useMemo } from "react"
import Link from "next/link"
import GameLayout, { GameTitle } from "@/app/(game)/game-layout"
import GameResults from "@/app/(game)/game-results"
import { Button } from "@/components/ui/button"
import { decodeResult } from "@/lib/result-codec"

export default function ResultsPage({
  params,
}: {
  params: Promise<{ encoded: string }>
}) {
  const { encoded } = use(params)
  const result = useMemo(() => decodeResult(encoded), [encoded])

  if (!result) {
    return (
      <GameLayout>
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground font-mono">Invalid or expired result link</p>
          <Button asChild variant="secondary">
            <Link href="/">Play</Link>
          </Button>
        </div>
      </GameLayout>
    )
  }

  const { prompt, runStats, score, scoringMode } = result
  const progressLeft = `${runStats.correctChars} / ${runStats.targetChars}`

  // Ctrl/Cmd + Enter to go again
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        window.location.href = "/"
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <GameLayout>
      <GameTitle />
      <GameResults
        prompt={prompt}
        target={prompt.code}
        progressLeft={progressLeft}
        score={score}
        runStats={runStats}
        scoringMode={scoringMode}
        onNewSnippet={() => {
          window.location.href = "/"
        }}
      />
    </GameLayout>
  )
}

