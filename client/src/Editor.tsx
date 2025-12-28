import React, { useEffect, useRef, useState } from "react"
import type { EditorProgress } from "./types"

interface EditorProps {
  target: string
  onProgress: (info: EditorProgress) => void
  disabled?: boolean
}

export function Editor({ target, onProgress, disabled }: EditorProps) {
  const [typed, setTyped] = useState<string>("")
  const [error, setError] = useState<boolean>(false)
  const [totalTyped, setTotalTyped] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // State resets are handled by remount via parent using a changing key.

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

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={containerRef}
        role="textbox"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className={
          `min-h-30 rounded-lg p-3 font-mono whitespace-pre-wrap outline-none ` +
          (error
            ? "border-2 border-red-500 bg-red-50"
            : "border-2 border-neutral-400 bg-neutral-100")
        }
      >
        <span className="text-green-600">{typed || "\u200b"}</span>
        <span className="text-neutral-600">{remaining}</span>
      </div>
      <small className={error ? "text-red-600" : "text-neutral-600"}>
        {error
          ? "Error: press Backspace to clear."
          : "Type the snippet exactly. No paste or arrows."}
      </small>
    </div>
  )
}

export default Editor
