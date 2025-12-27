"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const SidebarInput = React.forwardRef<
  React.ElementRef<typeof import("@/components/atoms/input").Input>,
  React.ComponentProps<typeof import("@/components/atoms/input").Input>
>(({ className, ...props }, ref) => {
  // We dynamic import or assume atom input is available.
  // Using direct import to atom in real implementation
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Input } = require("@/components/atoms/input");

  return (
    <Input
      className={cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className
      )}
      data-sidebar='input'
      ref={ref}
      {...props}
    />
  );
});
SidebarInput.displayName = "SidebarInput";
