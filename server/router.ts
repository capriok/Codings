import { scoreController } from "./controllers/scoreController"
import { withCors } from "./utils/cors"

export async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url)

  // Preflight
  if (req.method === "OPTIONS") {
    return withCors(new Response(null, { status: 204 }))
  }

  if (req.method === "POST" && url.pathname === "/score") {
    return withCors(await scoreController(req))
  }

  return withCors(
    new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  )
}
