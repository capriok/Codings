"use client"

import { useSpring, useTransform, type MotionValue } from "motion/react"
import { useEffect } from "react"

interface CountUpOptions {
  /** Animation duration in milliseconds (default: 800) */
  duration?: number
  /** Delay before animation starts in milliseconds (default: 0) */
  delay?: number
  /** Number of decimal places (default: 0) */
  decimals?: number
}

/**
 * Animates a number from 0 to a target value with spring physics.
 * Returns a MotionValue that can be used with motion components.
 */
export function useCountUp(
  target: number,
  options: CountUpOptions = {}
): MotionValue<number> {
  const { duration = 800, delay = 0 } = options

  const spring = useSpring(0, {
    duration,
    bounce: 0,
  })

  useEffect(() => {
    const timeout = setTimeout(() => {
      spring.set(target)
    }, delay)

    return () => clearTimeout(timeout)
  }, [target, spring, delay])

  return spring
}

/**
 * Same as useCountUp but returns a formatted string.
 * Useful for displaying percentages, decimals, etc.
 */
export function useCountUpFormatted(
  target: number,
  options: CountUpOptions & { format?: (value: number) => string } = {}
): MotionValue<string> {
  const { format = (v) => v.toFixed(options.decimals ?? 0), ...rest } = options
  const spring = useCountUp(target, rest)

  return useTransform(spring, format)
}

