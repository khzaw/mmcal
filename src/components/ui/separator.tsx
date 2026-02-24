import { cn } from "@/lib/utils"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import type * as React from "react"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  const baseClass =
    orientation === "horizontal"
      ? "shrink-0 h-px w-full bg-gradient-to-r from-transparent via-border/55 to-transparent"
      : "shrink-0 h-full w-px bg-border/40"

  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(baseClass, className)}
      {...props}
    />
  )
}

export { Separator }
