"use client"

import { useTheme } from "next-themes"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const themes = [
  { value: "light", icon: SunIcon, label: "Light" },
  { value: "dark", icon: MoonIcon, label: "Dark" },
  { value: "system", icon: MonitorIcon, label: "System" },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border/30 bg-card p-0.5">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={cn(
            "flex items-center justify-center rounded-md p-1.5 transition-all",
            theme === value
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground/60 hover:text-foreground"
          )}
          title={label}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  )
}

