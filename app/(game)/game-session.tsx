"use client"

import { useMemo } from "react"
import { motion } from "motion/react"
import GameEditor from "@/app/(game)/game-editor"
import type { EditorProgress, Prompt } from "@/lib/types"

// Animation timing constants (in ms)
const TIMING = {
  codeDelay: 0,
  editorDelay: 150,
}

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
      <div className="flex flex-col gap-3">
        {/* Target code display */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: TIMING.codeDelay / 1000 }}
          className="flex rounded-lg cursor-default select-none border border-border/30 bg-card font-mono text-sm leading-relaxed text-foreground/90 overflow-hidden"
        >
          {/* Line numbers gutter */}
          <div
            className="shrink-0 border-r border-border/20 bg-muted/30 px-3 py-4 text-right text-muted-foreground/40"
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
        </motion.div>

        {/* Editor with inset redo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: TIMING.editorDelay / 1000 }}
        >
          <GameEditor
            key={`${prompt.id}-${editorKey}-${length}`}
            target={target}
            onProgress={onProgress}
            onRedo={onNewSnippet}
          />
        </motion.div>
      </div>
    </section>
  )
}
