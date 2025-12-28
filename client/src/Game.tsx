import { useEffect, useMemo, useRef, useState } from "react"
import { PROMPTS } from "./prompts"
import { Editor } from "./Editor"
import type { RaceResult, ServerScoreResponse, Screen, EditorProgress } from "./types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { ThemeToggle } from "@/components/theme-toggle"

// Screen type now comes from shared types

export default function Game() {
  const [screen, setScreen] = useState<Screen>("home")
  const [promptIndex, setPromptIndex] = useState<number>(0)
  const prompt = useMemo(() => PROMPTS[promptIndex], [promptIndex])

  const [typed, setTyped] = useState("")
  const [error, setError] = useState(false)

  const [startMs, setStartMs] = useState<number | null>(null)
  const [firstRenderMs, setFirstRenderMs] = useState<number | null>(null)
  const [nowMs, setNowMs] = useState<number>(0)
  const keystrokesRef = useRef<number[]>([])
  const [score, setScore] = useState<ServerScoreResponse | null>(null)

  function startRace() {
    setScreen("race")
    setPromptIndex(Math.floor(Math.random() * PROMPTS.length))
    setTyped("")
    setError(false)
    setStartMs(null)
    keystrokesRef.current = []
    setScore(null)
    setFirstRenderMs(Date.now())
  }

  async function finishRace(result: RaceResult) {
    const res = await fetch("http://localhost:3001/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    })
    const data: ServerScoreResponse = await res.json()
    setScore(data)
    setScreen("results")

    if (firstRenderMs && startMs) {
      console.log("[anti-cheat] time to first keystroke ms:", startMs - firstRenderMs)
    }
    console.log("[anti-cheat] keystroke timestamps:", keystrokesRef.current)
  }

  function onProgress(info: EditorProgress) {
    if (!startMs) setStartMs(info.keystrokeTs)
    keystrokesRef.current.push(info.keystrokeTs)
    setTyped(info.typed)
    setError(info.error)

    if (info.typed.length === prompt.code.length) {
      const end = info.keystrokeTs
      const timeMs = startMs ?? end ? end - (startMs ?? end) : 0
      const result: RaceResult = {
        correctCharacters: info.correctCharacters,
        totalTypedCharacters: info.totalTypedCharacters,
        timeMs,
      }
      void finishRace(result)
    }
  }

  useEffect(() => {
    if (screen !== "race") return
    const id = setInterval(() => setNowMs(Date.now()), 100)
    return () => clearInterval(id)
  }, [screen])

  if (screen === "home") {
    return (
      <div className="grid min-h-svh place-items-center">
        <Card className="w-[min(100%-2rem,48rem)] data-[state=open]:animate-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Code Copy Race</CardTitle>
                <CardDescription>
                  Type the exact TypeScript snippet as fast as possible.
                </CardDescription>
              </div>
              <ThemeToggle />
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              Race against your own focus. No paste, no arrows — just pure typing.
            </p>
            <div className="flex gap-2">
              <Button onClick={startRace}>Start Race</Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">How it works</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>How it works</DialogTitle>
                    <DialogDescription>
                      You’ll be shown a TypeScript snippet. Type it exactly. Every
                      keystroke is recorded. Backspace only clears errors. Paste and
                      navigation are blocked to keep the race fair.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <span className="text-xs text-muted-foreground">
              Made for 2025 — smooth, fast, and focused.
            </span>
            <a
              className="text-xs text-muted-foreground hover:underline"
              href="https://lucide.dev"
              target="_blank"
              rel="noreferrer"
            >
              Icons by Lucide
            </a>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (screen === "race") {
    const elapsed = startMs ? nowMs - startMs : 0
    const progress = `${typed.length} / ${prompt.code.length}`

    return (
      <div className="grid min-h-svh place-items-center">
        <Card className="w-[min(100%-2rem,64rem)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Race</CardTitle>
                <CardDescription className="flex gap-4 mt-1">
                  <span>
                    <span className="font-semibold">Progress:</span> {progress}
                  </span>
                  <span>
                    <span className="font-semibold">Timer:</span> {elapsed} ms
                  </span>
                  <span>
                    <span className="font-semibold">Error:</span> {error ? "Yes" : "No"}
                  </span>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="secondary">Restart</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Restart the race?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your current progress will be lost.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel asChild>
                        <Button variant="secondary">Cancel</Button>
                      </AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button onClick={startRace}>Restart</Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            <section>
              <h3 className="mb-2 font-medium">Prompt</h3>
              <pre className="rounded-lg border bg-neutral-100 p-3 dark:bg-neutral-900/30">
                {prompt.code}
              </pre>
            </section>
            <section>
              <h3 className="mb-2 font-medium">Type Here</h3>
              <Editor key={prompt.id} target={prompt.code} onProgress={onProgress} />
            </section>
          </CardContent>
          <CardFooter className="justify-between">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">Tips</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Typing Tips</DialogTitle>
                  <DialogDescription>
                    Focus on rhythm and accuracy. If you make a mistake, press Backspace
                    once to clear error mode, then continue. Keep your eyes on the target
                    snippet.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <Button onClick={() => setScreen("results")}>Finish early</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid min-h-svh place-items-center">
      <Card className="w-[min(100%-2rem,40rem)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Results</CardTitle>
            <ThemeToggle />
          </div>
          <CardDescription>Your performance metrics from this race.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div>
            <span className="font-semibold">cWPM:</span> {score?.cWPM.toFixed(2)}
          </div>
          <div>
            <span className="font-semibold">Accuracy:</span>{" "}
            {(score?.accuracy ?? 0).toFixed(3)}
          </div>
          <div>
            <span className="font-semibold">Score:</span> {score?.score.toFixed(2)}
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">What do these mean?</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Score metrics</DialogTitle>
                <DialogDescription>
                  cWPM is code words per minute (token-ish chunks). Accuracy is correct
                  characters over total typed. Overall score blends speed and accuracy.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Button onClick={() => setScreen("home")}>Race again</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
