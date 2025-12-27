"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/atoms/separator";

export const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      data-sidebar='separator'
      ref={ref}
      {...props}
    />
  );
});
SidebarSeparator.displayName = "SidebarSeparator";
