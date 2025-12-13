"use client";
import React from "react";

import { useSidebar } from "@/lib/context/sidebar-context";
import ChatHistory from "@/components/organisms/chat-history";
import { NavBar } from "@/components/organisms/nav-bar";
import { ChatProvider } from "@/lib/context/chat-context";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isOpen } = useSidebar();
  return (
    <ChatProvider>
      <div className='flex items-center justify-center w-full h-screen bg-background'>
        <div className=' flex items-center justify-center p-4 w-[20vw] h-screen'>
          <ChatHistory />
        </div>

        {/* Main Content */}
        <main
          className={`flex-grow transition-layout w-[80vw] h-screen overflow-y-auto scroll-smooth pt-8 pb-6`}
        >
          <div className='w-full py-4 rounded-xl'>
            <NavBar />
          </div>
          <div className='w-full h-[calc(100vh-165px)]'>{children}</div>
        </main>
      </div>
    </ChatProvider>
  );
}
