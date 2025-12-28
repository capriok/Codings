"use client"

import { motion, useSpring, useTransform } from "motion/react"
import { useEffect, type ReactNode } from "react"
import Tip from "@/components/tip"

interface AnimatedStatCardProps {
  label: string
  value: number
  format?: (value: number) => string
  tip?: string
  accent?: boolean
  delay?: number
  duration?: number
}

/**
 * Large stat card with count-up animation.
 * Used for main stats like WPM, Accuracy, Time.
 */
export function AnimatedStatCard({
  label,
  value,
  format = (v) => v.toFixed(0),
  tip,
  accent,
  delay = 0,
  duration = 800,
}: AnimatedStatCardProps) {
  const spring = useSpring(0, { duration, bounce: 0 })

  useEffect(() => {
    const timeout = setTimeout(() => spring.set(value), delay)
    return () => clearTimeout(timeout)
  }, [value, spring, delay])

  const displayed = useTransform(spring, format)

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000 }}
      className="rounded-xl border border-border/30 bg-muted/40 p-4 text-center"
    >
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
        {label}
      </div>
      <motion.div
        className={`mt-1 font-mono text-2xl font-bold ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {displayed}
      </motion.div>
    </motion.div>
  )

  return tip ? <Tip tip={tip}>{content}</Tip> : content
}

interface AnimatedStatProps {
  label: string
  value: number | string
  format?: (value: number) => string
  tip?: string
  delay?: number
  duration?: number
}

/**
 * Smaller inline stat with count-up animation.
 * Used for secondary stats like Raw WPM, Mistakes, etc.
 */
export function AnimatedStat({
  label,
  value,
  format = (v) => v.toFixed(0),
  tip,
  delay = 0,
  duration = 600,
}: AnimatedStatProps) {
  // Handle string values (like "—" for null) without animation
  const isNumeric = typeof value === "number"

  const spring = useSpring(0, { duration, bounce: 0 })

  useEffect(() => {
    if (!isNumeric) return
    const timeout = setTimeout(() => spring.set(value), delay)
    return () => clearTimeout(timeout)
  }, [value, spring, delay, isNumeric])

  const displayed = useTransform(spring, format)

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: delay / 1000 }}
      className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2"
    >
      <span className="font-mono text-xs text-muted-foreground/70">{label}</span>
      <motion.span className="font-mono text-sm font-medium text-foreground/80">
        {isNumeric ? displayed : value}
      </motion.span>
    </motion.div>
  )

  return tip ? <Tip tip={tip}>{content}</Tip> : content
}

interface AnimatedScoreProps {
  score: number
  delay?: number
  duration?: number
}

/**
 * Large score display with count-up animation.
 */
export function AnimatedScore({ score, delay = 0, duration = 1000 }: AnimatedScoreProps) {
  const spring = useSpring(0, { duration, bounce: 0 })

  useEffect(() => {
    const timeout = setTimeout(() => spring.set(score), delay)
    return () => clearTimeout(timeout)
  }, [score, spring, delay])

  const displayed = useTransform(spring, (v) => v.toFixed(0))

  return (
    <Tip tip="Combined score based on WPM and accuracy">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: delay / 1000 }}
        className="rounded-lg bg-primary/10 px-4 py-3 text-center"
      >
        <motion.span className="font-mono text-2xl font-bold text-primary">
          {displayed}
        </motion.span>
        <span className="ml-2 font-mono text-xs text-muted-foreground">score</span>
      </motion.div>
    </Tip>
  )
}

