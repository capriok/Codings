import { describe, it, expect } from "vitest"
import {
  computeScore,
  computeSimpleScore,
  computeTunedScore,
  getDifficultyMultiplier,
  getConsistencyMultiplier,
  getEffectiveAccuracy,
} from "./score"

// ─────────────────────────────────────────────────────────────────────────────
// Difficulty Multiplier Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("getDifficultyMultiplier", () => {
  it("returns 1.0 for easy", () => {
    expect(getDifficultyMultiplier("easy")).toBe(1.0)
  })

  it("returns 1.15 for medium", () => {
    expect(getDifficultyMultiplier("medium")).toBe(1.15)
  })

  it("returns 1.35 for hard", () => {
    expect(getDifficultyMultiplier("hard")).toBe(1.35)
  })

  it("never exceeds 1.35", () => {
    expect(getDifficultyMultiplier("hard")).toBeLessThanOrEqual(1.35)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Consistency Multiplier Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("getConsistencyMultiplier", () => {
  it("returns 1.0 for null consistency", () => {
    expect(getConsistencyMultiplier(null)).toBe(1.0)
  })

  it("returns 1.0 for 0 consistency", () => {
    expect(getConsistencyMultiplier(0)).toBe(1.0)
  })

  it("returns 1.20 for 100 consistency (max bonus)", () => {
    expect(getConsistencyMultiplier(100)).toBe(1.2)
  })

  it("is monotonically increasing with consistency", () => {
    const values = [0, 25, 50, 75, 100].map(getConsistencyMultiplier)
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]!)
    }
  })

  it("uses quadratic scaling (50 consistency gives less than half the bonus)", () => {
    const mid = getConsistencyMultiplier(50)
    const max = getConsistencyMultiplier(100)
    const midBonus = mid - 1.0
    const maxBonus = max - 1.0
    expect(midBonus).toBeLessThan(maxBonus / 2)
  })

  it("never exceeds 1.20", () => {
    expect(getConsistencyMultiplier(100)).toBeLessThanOrEqual(1.2)
    expect(getConsistencyMultiplier(150)).toBeLessThanOrEqual(1.2) // clamped
  })

  it("never goes below 1.0 (no penalty)", () => {
    expect(getConsistencyMultiplier(0)).toBeGreaterThanOrEqual(1.0)
    expect(getConsistencyMultiplier(-10)).toBeGreaterThanOrEqual(1.0) // clamped
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Effective Accuracy Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("getEffectiveAccuracy", () => {
  it("returns raw accuracy for snippets >= 80 chars", () => {
    expect(getEffectiveAccuracy(0.9, 80)).toBeCloseTo(0.9)
    expect(getEffectiveAccuracy(0.9, 100)).toBeCloseTo(0.9)
    expect(getEffectiveAccuracy(0.9, 200)).toBeCloseTo(0.9)
  })

  it("returns 1.0 for 0-length snippets (full forgiveness)", () => {
    expect(getEffectiveAccuracy(0.5, 0)).toBeCloseTo(1.0)
  })

  it("softens accuracy for short snippets", () => {
    // 40 chars = 50% weight → lerp(1, 0.8, 0.5) = 0.9
    expect(getEffectiveAccuracy(0.8, 40)).toBeCloseTo(0.9)
  })

  it("scales linearly between 0 and 80 chars", () => {
    // 20 chars = 25% weight → lerp(1, 0.8, 0.25) = 0.95
    expect(getEffectiveAccuracy(0.8, 20)).toBeCloseTo(0.95)
  })

  it("handles perfect accuracy unchanged", () => {
    expect(getEffectiveAccuracy(1.0, 40)).toBeCloseTo(1.0)
    expect(getEffectiveAccuracy(1.0, 80)).toBeCloseTo(1.0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Score Calculation Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("computeScore", () => {
  const baseInput = {
    correctCharacters: 100,
    totalTypedCharacters: 100,
    timeMs: 60000, // 1 minute = 20 WPM for 100 chars
  }

  it("calculates correct cWPM", () => {
    const result = computeScore(baseInput)
    expect(result.cWPM).toBeCloseTo(20) // 100 chars / 5 / 1 min
  })

  it("calculates correct accuracy", () => {
    const result = computeScore({
      ...baseInput,
      correctCharacters: 90,
      totalTypedCharacters: 100,
    })
    expect(result.accuracy).toBeCloseTo(0.9)
  })

  it("applies difficulty multiplier correctly", () => {
    const easy = computeScore({ ...baseInput, difficulty: "easy" })
    const medium = computeScore({ ...baseInput, difficulty: "medium" })
    const hard = computeScore({ ...baseInput, difficulty: "hard" })

    expect(hard.score).toBeGreaterThan(medium.score)
    expect(medium.score).toBeGreaterThan(easy.score)
    expect(hard.score / easy.score).toBeCloseTo(1.35)
    expect(medium.score / easy.score).toBeCloseTo(1.15)
  })

  it("applies consistency bonus correctly", () => {
    const noConsistency = computeScore({ ...baseInput, consistency: null })
    const lowConsistency = computeScore({ ...baseInput, consistency: 50 })
    const highConsistency = computeScore({ ...baseInput, consistency: 100 })

    expect(highConsistency.score).toBeGreaterThan(lowConsistency.score)
    expect(lowConsistency.score).toBeGreaterThan(noConsistency.score)
  })

  it("applies length normalization to accuracy", () => {
    // Short snippet with 90% accuracy should score higher than raw formula
    const shortSnippet = computeScore({
      correctCharacters: 36, // 90% of 40
      totalTypedCharacters: 40,
      timeMs: 30000,
      targetChars: 40,
    })

    const longSnippet = computeScore({
      correctCharacters: 72, // 90% of 80
      totalTypedCharacters: 80,
      timeMs: 60000,
      targetChars: 80,
    })

    // Both have same cWPM (14.4) and same raw accuracy (0.9)
    // Short snippet should have higher effective accuracy
    expect(shortSnippet.cWPM).toBeCloseTo(longSnippet.cWPM)
    expect(shortSnippet.score).toBeGreaterThan(longSnippet.score)
  })

  it("defaults to easy difficulty when not specified", () => {
    const withDefault = computeScore(baseInput)
    const withExplicit = computeScore({ ...baseInput, difficulty: "easy" })
    expect(withDefault.score).toBe(withExplicit.score)
  })

  it("handles null consistency as no bonus", () => {
    const withNull = computeScore({ ...baseInput, consistency: null })
    const withZero = computeScore({ ...baseInput, consistency: 0 })
    expect(withNull.score).toBe(withZero.score)
  })

  describe("ordering at equal skill", () => {
    it("hard snippets score higher than medium at same WPM and accuracy", () => {
      const mediumScore = computeScore({
        ...baseInput,
        difficulty: "medium",
        targetChars: 100,
      })
      const hardScore = computeScore({
        ...baseInput,
        difficulty: "hard",
        targetChars: 100,
      })
      expect(hardScore.score).toBeGreaterThan(mediumScore.score)
    })

    it("medium snippets score higher than easy at same WPM and accuracy", () => {
      const easyScore = computeScore({
        ...baseInput,
        difficulty: "easy",
        targetChars: 100,
      })
      const mediumScore = computeScore({
        ...baseInput,
        difficulty: "medium",
        targetChars: 100,
      })
      expect(mediumScore.score).toBeGreaterThan(easyScore.score)
    })
  })

  describe("multiplier caps", () => {
    it("combined multipliers never exceed ~1.62x baseline", () => {
      // Max: 1.35 (hard) * 1.20 (100 consistency) = 1.62
      const maxMultiplied = computeScore({
        ...baseInput,
        difficulty: "hard",
        consistency: 100,
        targetChars: 100,
      })

      const baseline = computeScore({
        ...baseInput,
        difficulty: "easy",
        consistency: null,
        targetChars: 100,
      })

      const ratio = maxMultiplied.score / baseline.score
      expect(ratio).toBeLessThanOrEqual(1.62)
      expect(ratio).toBeCloseTo(1.62)
    })
  })

  describe("edge cases", () => {
    it("handles zero time (avoids divide by zero)", () => {
      const result = computeScore({ ...baseInput, timeMs: 0 })
      expect(Number.isFinite(result.cWPM)).toBe(true)
      expect(Number.isFinite(result.score)).toBe(true)
    })

    it("handles zero typed characters", () => {
      const result = computeScore({
        correctCharacters: 0,
        totalTypedCharacters: 0,
        timeMs: 1000,
      })
      expect(result.cWPM).toBe(0)
      expect(result.accuracy).toBe(0)
      expect(result.score).toBe(0)
    })
  })

  describe("scoring mode toggle", () => {
    it("uses tuned scoring by default", () => {
      const defaultResult = computeScore({
        ...baseInput,
        difficulty: "hard",
        consistency: 100,
        targetChars: 100,
      })
      const tunedResult = computeScore({
        ...baseInput,
        difficulty: "hard",
        consistency: 100,
        targetChars: 100,
        scoringMode: "tuned",
      })
      expect(defaultResult.score).toBe(tunedResult.score)
    })

    it("simple mode ignores difficulty multiplier", () => {
      const easySimple = computeScore({
        ...baseInput,
        difficulty: "easy",
        scoringMode: "simple",
      })
      const hardSimple = computeScore({
        ...baseInput,
        difficulty: "hard",
        scoringMode: "simple",
      })
      expect(easySimple.score).toBe(hardSimple.score)
    })

    it("simple mode ignores consistency bonus", () => {
      const noConsistencySimple = computeScore({
        ...baseInput,
        consistency: null,
        scoringMode: "simple",
      })
      const highConsistencySimple = computeScore({
        ...baseInput,
        consistency: 100,
        scoringMode: "simple",
      })
      expect(noConsistencySimple.score).toBe(highConsistencySimple.score)
    })

    it("simple mode uses raw accuracy (no length normalization)", () => {
      const shortSimple = computeScore({
        correctCharacters: 18, // 90% of 20
        totalTypedCharacters: 20,
        timeMs: 30000,
        targetChars: 20,
        scoringMode: "simple",
      })
      // Simple: cWPM * accuracy = (18/5/0.5) * 0.9 = 7.2 * 0.9 = 6.48
      expect(shortSimple.score).toBeCloseTo(6.48)
    })

    it("simple mode produces lower scores than tuned for hard+consistent runs", () => {
      const simpleResult = computeScore({
        ...baseInput,
        difficulty: "hard",
        consistency: 100,
        targetChars: 100,
        scoringMode: "simple",
      })
      const tunedResult = computeScore({
        ...baseInput,
        difficulty: "hard",
        consistency: 100,
        targetChars: 100,
        scoringMode: "tuned",
      })
      expect(tunedResult.score).toBeGreaterThan(simpleResult.score)
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Direct Function Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("computeSimpleScore", () => {
  it("calculates score as cWPM * accuracy", () => {
    const result = computeSimpleScore({
      correctCharacters: 100,
      totalTypedCharacters: 100,
      timeMs: 60000,
    })
    // cWPM = 100/5/1 = 20, accuracy = 1.0, score = 20
    expect(result.score).toBeCloseTo(20)
  })
})

describe("computeTunedScore", () => {
  it("applies all multipliers", () => {
    const result = computeTunedScore({
      correctCharacters: 100,
      totalTypedCharacters: 100,
      timeMs: 60000,
      difficulty: "hard",
      consistency: 100,
      targetChars: 100,
    })
    // cWPM = 20, accuracy = 1.0, difficulty = 1.35, consistency = 1.2
    // score = 20 * 1.0 * 1.35 * 1.2 = 32.4
    expect(result.score).toBeCloseTo(32.4)
  })
})

