"use client";

import Image from "next/image";
import type { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { guestRegex } from "@/lib/constants";
import { VisibilitySelector, type VisibilityType } from "./visibility-selector";

export function ChatNavbar({
  chatId,
  selectedVisibilityType,
  isReadonly,
  user,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  user: User | undefined;
}) {
  const { data, status } = useSession();
  const { setTheme, resolvedTheme } = useTheme();

  const isGuest = guestRegex.test(data?.user?.email ?? "");

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b bg-background px-4 py-2">
      {/* Left side: Panel toggle + Chat privacy */}
      <div className="flex items-center gap-2">
        <SidebarToggle />
        {!isReadonly && (
          <VisibilitySelector
            chatId={chatId}
            selectedVisibilityType={selectedVisibilityType}
          />
        )}
      </div>

      {/* Right side: User icon + Theme toggle */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          size="icon"
          variant="ghost"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* User Icon */}
        {user && status !== "loading" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-8 w-8 rounded-full p-0"
                variant="ghost"
              >
                <Image
                  alt={user.email ?? "User Avatar"}
                  className="rounded-full"
                  height={32}
                  src={`https://avatar.vercel.sh/${user.email}`}
                  width={32}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 text-sm">
                <div className="font-medium">
                  {isGuest ? "Guest" : user?.email}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
