"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot as SlotPrimitive } from "radix-ui";

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    className={cn("flex w-full min-w-0 flex-col gap-1", className)}
    data-sidebar='menu'
    ref={ref}
    {...props}
  />
));
SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    className={cn("group/menu-item relative", className)}
    data-sidebar='menu-item'
    ref={ref}
    {...props}
  />
));
SidebarMenuItem.displayName = "SidebarMenuItem";
