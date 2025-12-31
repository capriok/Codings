"use client"

import { useCallback, useState } from "react"
import type { GameResult, ServerScoreResponse } from "@/lib/types"

export function useScoreApi() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitScore = useCallback(async (result: GameResult): Promise<ServerScoreResponse> => {
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      })
      const data = (await res.json()) as ServerScoreResponse
      return data
    } catch (e) {
      setError("Score request failed")
      throw e
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { submitScore, isSubmitting, error }
}
