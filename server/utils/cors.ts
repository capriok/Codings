export function withCors(resp: Response): Response {
  const headers = new Headers(resp.headers)
  headers.set("Access-Control-Allow-Origin", "*")
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
  headers.set("Access-Control-Allow-Headers", "Content-Type")
  return new Response(resp.body, { status: resp.status, headers })
}
