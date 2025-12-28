"use client"

import { useSyncExternalStore } from "react"

function getModKey() {
  return /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl"
}

function subscribe() {
  return () => {}
}

export function useModKey() {
  return useSyncExternalStore(subscribe, getModKey, () => "⌘")
}
