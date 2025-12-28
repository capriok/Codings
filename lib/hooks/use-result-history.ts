"use client"

import { useCallback, useSyncExternalStore } from "react"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  id: string
  encoded: string
  timestamp: number
}

const STORAGE_KEY = "result-history"
const MAX_HISTORY = 50

// ─────────────────────────────────────────────────────────────────────────────
// Storage Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as HistoryEntry[]
  } catch {
    return []
  }
}

function setHistory(entries: HistoryEntry[]): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    // Dispatch storage event for same-tab listeners
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }))
  } catch {
    // Ignore quota errors
  }
}

function generateId(): string {
  return crypto.randomUUID().slice(0, 8)
}

// ─────────────────────────────────────────────────────────────────────────────
// External Store for React
// ─────────────────────────────────────────────────────────────────────────────

let cachedHistory: HistoryEntry[] | null = null

function subscribe(callback: () => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      cachedHistory = null
      callback()
    }
  }
  window.addEventListener("storage", handler)
  return () => window.removeEventListener("storage", handler)
}

function getSnapshot(): HistoryEntry[] {
  if (cachedHistory === null) {
    cachedHistory = getHistory()
  }
  return cachedHistory
}

function getServerSnapshot(): HistoryEntry[] {
  return []
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useResultHistory() {
  const history = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const addResult = useCallback((encoded: string): string => {
    const id = generateId()
    const entry: HistoryEntry = {
      id,
      encoded,
      timestamp: Date.now(),
    }
    const current = getHistory()
    // Add to front, limit size
    const updated = [entry, ...current].slice(0, MAX_HISTORY)
    setHistory(updated)
    cachedHistory = updated
    return id
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    cachedHistory = []
  }, [])

  const getResultById = useCallback((id: string): HistoryEntry | undefined => {
    return getHistory().find((e) => e.id === id)
  }, [])

  return {
    history,
    addResult,
    clearHistory,
    getResultById,
  }
}

