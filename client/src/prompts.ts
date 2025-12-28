import type { Prompt } from "./types"

export const PROMPTS: Prompt[] = [
  {
    id: "00",
    language: "ts",
    difficulty: "easy",
    code: `function noop() {}`,
  },
  // {
  //   id: "1",
  //   language: "ts",
  //   difficulty: "easy",
  //   code: `function add(a: number, b: number): number {\n  return a + b;\n}`,
  // },
  // {
  //   id: "2",
  //   language: "ts",
  //   difficulty: "medium",
  //   code: `type Point = { x: number; y: number };\nfunction dist(p: Point): number {\n  return Math.sqrt(p.x * p.x + p.y * p.y);\n}`,
  // },
  // {
  //   id: "3",
  //   language: "ts",
  //   difficulty: "medium",
  //   code: `function uniq<T>(arr: T[]): T[] {\n  const seen = new Set<T>();\n  for (const v of arr) {\n    if (!seen.has(v)) seen.add(v);\n  }\n  return Array.from(seen);\n}`,
  // },
  // {
  //   id: "4",
  //   language: "ts",
  //   difficulty: "hard",
  //   code: `function memo<T extends (...args: any[]) => any>(fn: T): T {\n  const cache = new Map<string, ReturnType<T>>();\n  return ((...args: Parameters<T>) => {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key)!;\n    const res = fn(...args);\n    cache.set(key, res);\n    return res;\n  }) as T;\n}`,
  // },
  // {
  //   id: "5",
  //   language: "ts",
  //   difficulty: "hard",
  //   code: `interface Result<E, T> { ok: boolean; error?: E; value?: T; }\nfunction safeParseJSON<T = unknown>(s: string): Result<string, T> {\n  try {\n    return { ok: true, value: JSON.parse(s) as T };\n  } catch (e) {\n    return { ok: false, error: (e as Error).message };\n  }\n}`,
  // },
]
