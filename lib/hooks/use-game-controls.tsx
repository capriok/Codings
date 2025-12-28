"use client"

import { useCallback, useEffect } from "react"
import type { GameDifficulty, GameLength } from "@/lib/hooks/use-game"
import { Kbd } from "@/components/ui/kbd"
import { CommandIcon, CornerDownLeftIcon } from "lucide-react"
import { cn } from "../utils"

interface UseGameControlsParams {
  lengths: readonly GameLength[]
  length: GameLength
  setLength: (l: GameLength) => void
  difficulties: readonly GameDifficulty[]
  difficulty: GameDifficulty
  setDifficulty: (d: GameDifficulty) => void
  newSnippet: () => void
  /** When true, Ctrl+Enter also triggers newSnippet (for results screen) */
  enableEnterShortcut?: boolean
}

/**
 * Keyboard shortcuts and cycling controls for the game.
 * Handles Ctrl/Cmd + R/L/D shortcuts.
 */
export function useGameControls({
  lengths,
  length,
  setLength,
  difficulties,
  difficulty,
  setDifficulty,
  newSnippet,
  enableEnterShortcut = false,
}: UseGameControlsParams) {
  const cycleLength = useCallback(() => {
    const currentIndex = lengths.indexOf(length)
    const nextIndex = (currentIndex + 1) % lengths.length
    setLength(lengths[nextIndex])
  }, [lengths, length, setLength])

  const cycleDifficulty = useCallback(() => {
    const currentIndex = difficulties.indexOf(difficulty)
    const nextIndex = (currentIndex + 1) % difficulties.length
    setDifficulty(difficulties[nextIndex])
  }, [difficulties, difficulty, setDifficulty])

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Only trigger with Ctrl/Cmd
      if (!e.ctrlKey && !e.metaKey) return

      switch (e.key.toLowerCase()) {
        case "r":
          e.preventDefault()
          newSnippet()
          break
        case "l":
          e.preventDefault()
          cycleLength()
          break
        case "d":
          e.preventDefault()
          cycleDifficulty()
          break
        case "enter":
          if (enableEnterShortcut) {
            e.preventDefault()
            newSnippet()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [newSnippet, cycleLength, cycleDifficulty, enableEnterShortcut])

  return { cycleLength, cycleDifficulty }
}

type ControlType = "new-snippet" | "cycle-length" | "cycle-difficulty" | "next-game"

const CONTROL_KEYS: Record<ControlType, React.ReactNode> = {
  "new-snippet": "R",
  "cycle-length": "L",
  "cycle-difficulty": "D",
  "next-game": <CornerDownLeftIcon className="size-3" />,
}

export function KDBGameControl({ type, flat }: { type: ControlType; flat?: boolean }) {
  const isMac =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent)
  const mod = isMac ? <CommandIcon className="size-3" /> : <span className="font-sans text-xs">Ctrl</span>
  const key = CONTROL_KEYS[type]

  const content = (
    <>
      <span className="font-sans text-xs">{mod}</span>
      <span className="text-xs">{key}</span>
    </>
  )

  if (flat) {
    return (
      <span className={cn("inline-flex items-center gap-1 font-mono text-xs")}>
        {content}
      </span>
    )
  }

  return <Kbd>{content}</Kbd>
}
