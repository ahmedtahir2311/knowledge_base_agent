"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      data-sidebar='content'
      ref={ref}
      {...props}
    />
  );
});
SidebarContent.displayName = "SidebarContent";
