"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"

interface TypewriterCodeProps {
  code: string
  /** Delay before typing starts in milliseconds */
  startDelay?: number
  /** Speed in characters per second (default: 60) */
  speed?: number
  /** Called when typing animation completes */
  onComplete?: () => void
}

export default function TypewriterCode({
  code,
  startDelay = 0,
  speed = 60,
  onComplete,
}: TypewriterCodeProps) {
  const [charIndex, setCharIndex] = useState(0)
  const [started, setStarted] = useState(false)

  const lines = useMemo(() => code.split("\n"), [code])
  const msPerChar = 1000 / speed

  // Start delay
  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), startDelay)
    return () => clearTimeout(timeout)
  }, [startDelay])

  // Typing animation
  useEffect(() => {
    if (!started) return
    if (charIndex >= code.length) {
      onComplete?.()
      return
    }

    const timeout = setTimeout(() => {
      setCharIndex((i) => i + 1)
    }, msPerChar)

    return () => clearTimeout(timeout)
  }, [started, charIndex, code.length, msPerChar, onComplete])

  // Calculate which lines are visible and their content
  const visibleContent = useMemo(() => {
    const typed = code.slice(0, charIndex)
    const typedLines = typed.split("\n")
    return typedLines
  }, [code, charIndex])

  // Calculate visible line count for line numbers
  const visibleLineCount = visibleContent.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: startDelay / 1000 }}
      className="flex rounded-lg cursor-default select-none border border-border/40 bg-muted/50 font-mono text-sm leading-relaxed text-foreground/90 overflow-hidden"
    >
      {/* Line numbers gutter */}
      <div
        className="shrink-0 border-r border-border/30 bg-muted/70 px-3 py-4 text-right text-muted-foreground/40"
        aria-hidden="true"
      >
        {lines.map((_, i) => (
          <div
            key={i}
            className="leading-relaxed transition-opacity duration-150"
            style={{ opacity: i < visibleLineCount ? 1 : 0.2 }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Code content */}
      <pre className="flex-1 whitespace-pre-wrap p-4 m-0 relative">
        {/* Typed text */}
        <span>{code.slice(0, charIndex)}</span>

        {/* Blinking cursor */}
        <AnimatePresence>
          {started && charIndex < code.length && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="inline-block w-[2px] h-[1.2em] bg-primary align-middle ml-[1px] animate-cursor-blink"
            />
          )}
        </AnimatePresence>

        {/* Placeholder for remaining text (invisible, maintains layout) */}
        <span className="invisible">{code.slice(charIndex)}</span>
      </pre>
    </motion.div>
  )
}

