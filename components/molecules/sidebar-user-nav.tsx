"use client";

import { ChevronUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { User } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/molecules/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/organisms/sidebar";
import { guestRegex } from "@/lib/constants";
import { LoaderIcon } from "lucide-react";
import { toast } from "@/components/atoms/toast";

export function SidebarUserNav({ user }: { user: User }) {
  const router = useRouter();
  const { data, status } = useSession();
  const { setTheme, resolvedTheme } = useTheme();

  const isGuest = guestRegex.test(data?.user?.email ?? "");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {status === "loading" ? (
              <SidebarMenuButton className='h-10 justify-between bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
                <div className='flex flex-row gap-2'>
                  <div className='size-6 animate-pulse rounded-full bg-zinc-500/30' />
                  <span className='animate-pulse rounded-md bg-zinc-500/30 text-transparent'>
                    Loading auth status
                  </span>
                </div>
                <div className='animate-spin text-zinc-500'>
                  <LoaderIcon />
                </div>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                className='h-10 bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                data-testid='user-nav-button'
              >
                <Image
                  alt={user.email ?? "User Avatar"}
                  className='rounded-full'
                  height={24}
                  src={`https://avatar.vercel.sh/${user.email}`}
                  width={24}
                />
                <span className='truncate' data-testid='user-email'>
                  {isGuest ? "Guest" : user?.email}
                </span>
                <ChevronUp className='ml-auto' />
              </SidebarMenuButton>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-popper-anchor-width)'
            data-testid='user-nav-menu'
            side='top'
          >
            {/* Theme toggle removed - now in navbar */}
            {/* Login button hidden as requested */}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
