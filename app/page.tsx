import Game from "./(game)/game"

export default function Home() {
  return (
    <main className="bg-background text-foreground flex items-center justify-center px-6">
      <Game />
    </main>
  )
}
