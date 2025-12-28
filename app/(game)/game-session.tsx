"use client"

import { useMemo } from "react"
import GameEditor from "@/app/(game)/game-editor"
import Tip from "@/components/tip"
import type { EditorProgress, Prompt } from "@/lib/types"

export default function GameSession({
  prompt,
  target,
  liveTimeMs,
  progressLeft,
  editorKey,
  length,
  onProgress,
  onNewSnippet,
}: {
  prompt: Prompt
  target: string
  liveTimeMs: number
  progressLeft: string
  editorKey: number
  length: number
  onProgress: (info: EditorProgress) => void
  onNewSnippet: () => void
}) {
  // Memoize target lines to avoid split on every render
  const targetLines = useMemo(() => target.split("\n"), [target])

  return (
    <section className="w-full select-none">
      <div className="flex flex-col gap-5 ">
        {/* Progress indicator */}
        <div className="flex items-center justify-between">
          <Tip tip="Characters typed / total" align="start">
            <span className="font-mono text-xs tracking-wide text-muted-foreground/80">
              {progressLeft}
            </span>
          </Tip>
          <Tip tip="Elapsed time" align="end">
            <span className="font-mono text-xs text-muted-foreground/50">
              {(liveTimeMs / 1000).toFixed(1)}s
            </span>
          </Tip>
        </div>

        {/* Target code display */}
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

        {/* Editor with inset redo */}
        <GameEditor
          key={`${prompt.id}-${editorKey}-${length}`}
          target={target}
          onProgress={onProgress}
          onRedo={onNewSnippet}
        />
      </div>
    </section>
  )
}
