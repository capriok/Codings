"use client"

import { useMemo } from "react"
import GameEditor from "@/app/(game)/game-editor"
import type { EditorProgress, Prompt } from "@/lib/types"

export default function GameSession({
  prompt,
  target,
  editorKey,
  length,
  onProgress,
  onNewSnippet,
}: {
  prompt: Prompt
  target: string
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
