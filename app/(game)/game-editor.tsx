"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { CornerDownLeftIcon, RotateCcw } from "lucide-react"
import { KDBGameControl } from "@/lib/hooks/use-game-controls"
import type { EditorProgress } from "@/lib/types"

// Static set - never changes, defined once outside component
const BLOCKED_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "PageUp",
  "PageDown",
  "Tab",
])

interface EditorProps {
  target: string
  onProgress: (info: EditorProgress) => void
  onRedo?: () => void
  disabled?: boolean
}

export function GameEditor({ target, onProgress, onRedo, disabled }: EditorProps) {
  const [typed, setTyped] = useState<string>("")
  const [error, setError] = useState<boolean>(false)
  const [wrongChar, setWrongChar] = useState<string | null>(null)
  const [totalTyped, setTotalTyped] = useState<number>(0)
  const [focused, setFocused] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Memoize line count to avoid recalculating on every render
  const lineCount = useMemo(() => target.split("\n").length, [target])

  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    console.log("[anti-cheat] paste prevented at", Date.now())
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (disabled) return
    const now = Date.now()

    if (BLOCKED_KEYS.has(e.key)) {
      e.preventDefault()
      return
    }

    if (e.ctrlKey || e.metaKey) {
      const k = e.key.toLowerCase()
      if (k === "z" || k === "y" || k === "a" || k === "x" || k === "c" || k === "v") {
        e.preventDefault()
        if (k === "v") console.log("[anti-cheat] paste shortcut prevented at", now)
        return
      }
    }

    if (error) {
      if (e.key === "Backspace") {
        e.preventDefault()
        setError(false)
        setWrongChar(null)
        onProgress({
          typed,
          correctCharacters: typed.length,
          totalTypedCharacters: totalTyped,
          error: false,
          keystrokeTs: now,
          isErrorRecovery: true,
        })
      }
      return
    }

    if (e.key === "Backspace") {
      e.preventDefault()
      if (typed.length > 0) {
        const next = typed.slice(0, -1)
        setTyped(next)
        onProgress({
          typed: next,
          correctCharacters: next.length,
          totalTypedCharacters: totalTyped,
          error: false,
          keystrokeTs: now,
        })
      }
      return
    }

    const keyChar = e.key === "Enter" ? "\n" : e.key
    if (keyChar.length !== 1) {
      e.preventDefault()
      return
    }

    e.preventDefault()

    const nextIndex = typed.length
    const expectedChar = target[nextIndex]

    if (keyChar === expectedChar) {
      const next = typed + keyChar
      const newTotal = totalTyped + 1
      setTyped(next)
      setTotalTyped(newTotal)
      onProgress({
        typed: next,
        correctCharacters: next.length,
        totalTypedCharacters: newTotal,
        error: false,
        keystrokeTs: now,
      })
    } else {
      const newTotal = totalTyped + 1
      setError(true)
      setWrongChar(keyChar)
      setTotalTyped(newTotal)
      onProgress({
        typed,
        correctCharacters: typed.length,
        totalTypedCharacters: newTotal,
        error: true,
        keystrokeTs: now,
        expectedChar: expectedChar,
      })
    }
  }

  const remaining = target.slice(typed.length)

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="relative w-full">
        <div
          ref={containerRef}
          role="textbox"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={
            `flex w-full rounded-lg border-2 font-mono text-sm leading-relaxed outline-none transition-all duration-150 focus:ring-2 focus:ring-primary/20 ` +
            (error
              ? "border-destructive/60 bg-destructive/5"
              : "border-border/30 bg-card focus:border-primary/40")
          }
        >
          {/* Line numbers gutter */}
          <div
            className="shrink-0 select-none border-r border-border/20 bg-muted/30 px-3 py-4 text-right text-muted-foreground/40"
            aria-hidden="true"
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="leading-relaxed">
                {i + 1}
              </div>
            ))}
          </div>
          {/* Code content */}
          <div className="min-h-[100px] flex-1 whitespace-pre-wrap p-4 pr-14">
            <span className={error ? "text-destructive" : "text-primary font-medium"}>
              {typed}
            </span>
            {error && wrongChar ? (
              <span
                className="bg-destructive/20 text-destructive font-bold border-b-2 border-destructive"
                title={`You typed "${wrongChar === "\n" ? "↵" : wrongChar}" instead of "${
                  target[typed.length] === "\n" ? "↵" : target[typed.length]
                }"`}
              >
                {wrongChar === "\n" ? "↵" : wrongChar}
              </span>
            ) : (
              <span
                className={`inline-block w-[2px] h-[1.2em] align-middle -ml-px ${
                  error ? "bg-destructive" : "bg-primary"
                } ${focused ? "animate-pulse" : "opacity-0"}`}
                aria-hidden="true"
              />
            )}
            <span className="text-muted-foreground/60">{remaining}</span>
          </div>
        </div>
        {onRedo && (
          <button
            type="button"
            onClick={onRedo}
            className="group absolute right-3 top-3 flex h-8 items-center gap-2 rounded-md px-2 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <div className="opacity-0 transition-opacity group-hover:opacity-100">
              <KDBGameControl type="new-snippet" />
            </div>
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>
      <p
        className={`font-mono text-xs transition-colors ${
          error ? "text-destructive" : "text-muted-foreground/70"
        }`}
      >
        {error && wrongChar ? (
          <span className="flex items-center gap-2">
            <span className="text-destructive">
              Expected{" "}
              <code className="bg-destructive/10 px-1 rounded">
                {target[typed.length] === "\n" ? "↵" : target[typed.length]}
              </code>{" "}
              got{" "}
              <code className="bg-destructive/10 px-1 rounded">
                {wrongChar === "\n" ? "↵" : wrongChar}
              </code>
            </span>
            <span className="text-muted-foreground/50">·</span>
            <span className="flex items-center gap-1">
              <CornerDownLeftIcon className="size-3" />
              Backspace
            </span>
          </span>
        ) : (
          <span>Type exactly · No paste or arrows</span>
        )}
      </p>
    </div>
  )
}

export default GameEditor
