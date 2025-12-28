import { cn } from "@/lib/utils"

interface KbdProps {
  children: React.ReactNode
  className?: string
}

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex h-6 min-w-10 select-none items-center justify-center gap-1 rounded border border-border/50 px-2 font-mono text-[10px] font-medium ",
        className
      )}
    >
      {children}
    </kbd>
  )
}
