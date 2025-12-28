"use client"

import { CommandIcon } from "lucide-react"
import { useSyncExternalStore } from "react"

function getModKey() {
  return /Mac|iPhone|iPad/.test(navigator.userAgent) ? <CommandIcon /> : "Ctrl"
}

function subscribe() {
  return () => {}
}

export function useModKey() {
  return useSyncExternalStore(subscribe, getModKey, () => <CommandIcon />)
}
