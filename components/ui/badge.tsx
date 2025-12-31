import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import type * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "h-[28px] gap-1 rounded-lg border border-transparent px-3 py-1 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-colors overflow-hidden group/badge",
  {
    variants: {
      variant: {
        // Primary
        default: "bg-primary/20 text-primary [a]:hover:bg-primary/30",
        "default-outline": "border-primary/40 bg-card/40 text-primary [a]:hover:bg-primary/20",
        // Secondary
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        "secondary-outline":
          "border-secondary bg-secondary/20 text-secondary-foreground [a]:hover:bg-secondary/30",
        // Destructive
        destructive:
          "bg-destructive/20 text-destructive [a]:hover:bg-destructive/30 dark:bg-destructive/20",
        "destructive-outline":
          "border-destructive/40 bg-card/40 text-destructive [a]:hover:bg-destructive/20",
        // Success
        success:
          "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 [a]:hover:bg-emerald-500/30",
        "success-outline":
          "border-emerald-500/40 bg bg-card/40 text-emerald-600 dark:text-emerald-400 [a]:hover:bg-emerald-500/20",
        // Warning
        warning: "bg-amber-500/20 text-amber-600 dark:text-amber-400 [a]:hover:bg-amber-500/30",
        "warning-outline":
          "border-amber-500/40 bg bg-card/40 text-amber-600 dark:text-amber-400 [a]:hover:bg-amber-500/20",
        // Utility variants
        outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
