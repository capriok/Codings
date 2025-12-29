"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { History, Clock, Zap, Target, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useResultHistory, type HistoryEntry } from "@/lib/hooks/use-result-history"
import { decodeResult } from "@/lib/result-codec"
import { cn } from "@/lib/utils"
import Tip from "@/components/ui/tip"
import type { Difficulty, PromptLines } from "@/lib/types"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface DecodedEntry {
  entry: HistoryEntry
  wpm: number
  accuracy: number
  score: number
  difficulty: Difficulty
  lines: PromptLines
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)

  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function difficultyLabel(d: string): string {
  return d.charAt(0).toUpperCase() + d.slice(1)
}

// ─────────────────────────────────────────────────────────────────────────────
// Result Item Component
// ─────────────────────────────────────────────────────────────────────────────

function ResultItem({
  item,
  onSelect,
}: {
  item: DecodedEntry
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left px-3 py-2.5 rounded-lg transition-colors",
        "bg-muted/30 hover:bg-muted/60 border border-transparent hover:border-border/40",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      )}
    >
      <div className="flex items-center justify-between gap-4 whitespace-nowrap">
        {/* Left side: stats */}
        <div className="flex items-center gap-4 font-mono text-sm">
          <Tip tip="Words per minute (corrected)" side="bottom">
            <span className="flex items-center gap-1.5 text-primary font-medium w-12 tabular-nums">
              <Zap className="size-3.5 shrink-0" />
              {Math.round(item.wpm)}
            </span>
          </Tip>
          <Tip tip="Typing accuracy %" side="bottom">
            <span className="flex items-center gap-1.5 text-muted-foreground w-14 tabular-nums">
              <Target className="size-3.5 shrink-0" />
              {(item.accuracy * 100).toFixed(0)}%
            </span>
          </Tip>
          <Tip tip="Difficulty level · Lines of code" side="bottom">
            <span className="text-muted-foreground/60 text-xs w-24">
              {difficultyLabel(item.difficulty)} · {item.lines}L
            </span>
          </Tip>
        </div>

        {/* Right side: time & score */}
        <div className="flex items-center gap-4 text-xs">
          <Tip tip="Final score (WPM × accuracy × difficulty)" side="bottom">
            <span className="font-mono font-medium text-foreground/80 w-20 text-right tabular-nums">
              {item.score.toLocaleString()} pts
            </span>
          </Tip>
          <Tip tip="Time since completed" side="bottom">
            <span className="flex items-center gap-1 text-muted-foreground/50 w-16 justify-end">
              <Clock className="size-3 shrink-0" />
              {formatTimeAgo(item.entry.timestamp)}
            </span>
          </Tip>
        </div>
      </div>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <History className="size-10 text-muted-foreground/30 mb-3" />
      <p className="text-sm text-muted-foreground">No recent results</p>
      <p className="text-xs text-muted-foreground/60 mt-1">
        Complete a game to see it here
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dialog Component
// ─────────────────────────────────────────────────────────────────────────────

export function RecentResultsDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { history, clearHistory } = useResultHistory()

  // Decode and enrich history entries
  const decodedHistory = useMemo((): DecodedEntry[] => {
    const results: DecodedEntry[] = []
    for (const entry of history) {
      const result = decodeResult(entry.encoded)
      if (!result) continue
      results.push({
        entry,
        wpm: result.runStats.correctWpm,
        accuracy: result.runStats.accuracy,
        score: result.score.score,
        difficulty: result.prompt.difficulty,
        lines: result.prompt.lines,
      })
    }
    return results
  }, [history])

  const handleSelect = (encoded: string) => {
    setOpen(false)
    router.push(`/${encoded}`)
  }

  const handleClear = () => {
    clearHistory()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tip tip="Recent results" align="end">
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground/60 hover:text-foreground"
          >
            <History className="size-4" />
            <span className="sr-only">Recent results</span>
          </Button>
        </DialogTrigger>
      </Tip>

      <DialogContent className="max-w-lg sm:max-w-lg">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base">
              <History className="size-4 text-muted-foreground" />
              Recent Results
            </DialogTitle>
            {/* {decodedHistory.length > 0 && (
              <Tip tip="Clear history" side="left">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 mr-4 text-muted-foreground/50 hover:text-destructive"
                  onClick={handleClear}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </Tip>
            )} */}
          </div>
        </DialogHeader>

        <div className="max-h-[50vh] overflow-y-auto -mx-1 px-1">
          {decodedHistory.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-1.5 py-1">
              {decodedHistory.map((item) => (
                <ResultItem
                  key={item.entry.id}
                  item={item}
                  onSelect={() => handleSelect(item.entry.encoded)}
                />
              ))}
            </div>
          )}
        </div>

        {decodedHistory.length > 0 && (
          <p className="text-[10px] text-muted-foreground/40 text-center pt-2 border-t border-border/20">
            Session history · {decodedHistory.length} result{decodedHistory.length !== 1 ? "s" : ""}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default RecentResultsDialog

