import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

export default function Tip({
  tip,
  className,
  align = "start",
  side = "bottom",
  children,
}: {
  tip: string
  className?: string
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          align={align}
          side={side}
          className={cn("select-none", className)}
        >
          {tip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
