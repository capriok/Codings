// Use Bun's HTTP server and delegate to a tiny router
import { handleRequest } from "./router"

const PORT = 3001

const server = Bun.serve({
  port: PORT,
  fetch: (req: Request) => handleRequest(req),
})

console.log(`Score server on http://localhost:${PORT}`)
