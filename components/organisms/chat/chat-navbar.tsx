"use client";

import Image from "next/image";
import type { User } from "next-auth";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Moon, PlusIcon, Sun, UserIcon, Book } from "lucide-react";
import { Button } from "@/components/atoms/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/molecules/dropdown-menu";
import { guestRegex } from "@/lib/constants";

export function ChatNavbar({
  chatId,
  isReadonly,
  user,
  isLoading,
}: {
  chatId: string;
  isReadonly: boolean;
  user: User | undefined;
  isLoading: boolean;
}) {
  const { data, status } = useSession();
  const { setTheme, resolvedTheme } = useTheme();
  const router = useRouter();

  const isGuest = guestRegex.test(data?.user?.email ?? "");

  return (
    <nav className='sticky top-0 z-50 flex items-center justify-between border-b bg-background px-4 py-2'>
      {/* Left side: Panel toggle + Chat privacy */}
      {/* Left side: Panel toggle + Chat privacy */}
      <div className='flex items-center gap-2'>
        <Button
          className='md:h-8 md:w-8'
          disabled={isLoading}
          onClick={() => {
            router.push("/");
            router.refresh();
          }}
          size='icon'
          variant='ghost'
        >
          <PlusIcon className='size-5' />
          <span className='sr-only'>New Chat</span>
        </Button>
      </div>

      {/* Right side: User icon + Theme toggle */}
      <div className='flex items-center gap-2'>
        {/* Theme Toggle */}
        <Button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          size='icon'
          variant='ghost'
        >
          {resolvedTheme === "dark" ? (
            <Sun className='h-5 w-5' />
          ) : (
            <Moon className='h-5 w-5' />
          )}
          <span className='sr-only'>Toggle theme</span>
        </Button>

        {/* User Icon */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className='h-8 w-8 rounded-full p-0' variant='ghost'>
              {user?.email ? (
                <Image
                  alt={user.email}
                  className='rounded-full'
                  height={32}
                  src={`https://avatar.vercel.sh/${user.email}`}
                  width={32}
                />
              ) : (
                <div className='flex size-8 items-center justify-center rounded-full bg-muted'>
                  <UserIcon size={18} className='text-muted-foreground' />
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48 p-2'>
            {user && !isGuest ? (
              <div className='px-2 py-1.5 text-sm'>
                <div className='font-medium truncate'>{user.email}</div>
              </div>
            ) : (
              <div className='flex flex-col gap-2'>
                <div className='px-2 py-1 text-xs font-medium text-muted-foreground'>
                  {isGuest ? "Guest User" : "Not Logged In"}
                </div>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
