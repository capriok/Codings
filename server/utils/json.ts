export async function json(req: Request): Promise<any> {
  // Bun provides fast JSON parsing via Request.json()
  return await req.json()
}
