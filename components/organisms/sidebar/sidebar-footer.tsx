"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn("flex flex-col gap-2 p-2", className)}
      data-sidebar='footer'
      ref={ref}
      {...props}
    />
  );
});
SidebarFooter.displayName = "SidebarFooter";
