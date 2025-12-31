import Link from "next/link"
import Tip from "@/components/ui/tip"
import { ThemeToggle } from "@/components/theme-toggle"
import { KDBGameControl } from "@/lib/hooks/use-game-controls"
import { cn } from "@/lib/utils"

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-background text-foreground flex flex-col items-center min-h-screen">
      <GameTitle />
      <div className="flex max-w-200 w-full flex-col px-2 md:px-0 justify-center items-center mt-16 md:6 w-full">
        {children}
      </div>
    </main>
  )
}
export function GameTitle({ className }: { className?: string }) {
  return (
    <div className={cn("text-center mt-8 mb-12", className)}>
      <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
        <Tip
          align="center"
          side="bottom"
          tip={
            <div className="flex flex-col gap-3 py-1">
              <p className="text-sm">Type code snippets as fast as you can</p>
              <div className="flex flex-col gap-1.5 border-t border-border/50 pt-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs">New snippet</span>
                  <KDBGameControl type="new-snippet" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs">Cycle lines</span>
                  <KDBGameControl type="cycle-length" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs">Cycle difficulty</span>
                  <KDBGameControl type="cycle-difficulty" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs">Next (results)</span>
                  <KDBGameControl type="next-game" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-border/50 pt-2">
                <span className="text-xs">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          }
        >
          <Link href="/" className="hover:opacity-80 transition-opacity">
            codings<span className="text-primary">_</span>
          </Link>
        </Tip>
      </h1>
    </div>
  )
}
