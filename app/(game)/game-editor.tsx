"use client"

import React, { useEffect, useRef, useState } from "react"
import { RotateCcw } from "lucide-react"
import Tip from "@/components/tip"
import type { EditorProgress } from "@/lib/types"

interface EditorProps {
  target: string
  onProgress: (info: EditorProgress) => void
  onRedo?: () => void
  disabled?: boolean
}

export function GameEditor({ target, onProgress, onRedo, disabled }: EditorProps) {
  const [typed, setTyped] = useState<string>("")
  const [error, setError] = useState<boolean>(false)
  const [totalTyped, setTotalTyped] = useState<number>(0)
  const [focused, setFocused] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  const blockedKeys = new Set([
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

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    console.log("[anti-cheat] paste prevented at", Date.now())
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (disabled) return
    const now = Date.now()

    if (blockedKeys.has(e.key)) {
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
        onProgress({
          typed,
          correctCharacters: typed.length,
          totalTypedCharacters: totalTyped,
          error: false,
          keystrokeTs: now,
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
      setTyped(next)
      setTotalTyped((prev: number) => {
        const newTotal = prev + 1
        onProgress({
          typed: next,
          correctCharacters: next.length,
          totalTypedCharacters: newTotal,
          error: false,
          keystrokeTs: now,
        })
        return newTotal
      })
    } else {
      setError(true)
      setTotalTyped((prev: number) => {
        const newTotal = prev + 1
        onProgress({
          typed,
          correctCharacters: typed.length,
          totalTypedCharacters: newTotal,
          error: true,
          keystrokeTs: now,
        })
        return newTotal
      })
    }
  }

  const remaining = target.slice(typed.length)
  const lines = target.split("\n")
  const lineCount = lines.length

  return (
    <div className="flex w-full flex-col gap-2">
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
              : "border-border/50 bg-muted/30 focus:border-primary/40")
          }
        >
          {/* Line numbers gutter */}
          <div
            className="shrink-0 select-none border-r border-border/30 bg-muted/50 px-3 py-4 text-right text-muted-foreground/40"
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
            <span
              className={`inline-block w-[2px] h-[1.2em] align-middle -ml-px ${
                error ? "bg-destructive" : "bg-primary"
              } ${focused ? "animate-pulse" : "opacity-0"}`}
              aria-hidden="true"
            />
            <span className="text-muted-foreground/60">{remaining}</span>
          </div>
        </div>
        {onRedo && (
          <Tip tip="Get a new snippet">
            <button
              type="button"
              onClick={onRedo}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </Tip>
        )}
      </div>
      <p
        className={`font-mono text-xs transition-colors ${
          error ? "text-destructive" : "text-muted-foreground/70"
        }`}
      >
        {error ? "↵ Backspace to continue" : "Type exactly · No paste or arrows"}
      </p>
    </div>
  )
}

export default GameEditor
