"use client";
import React from "react";

import Sidebar from "@/components/organisms/sidebar";
import { useSidebar } from "@/lib/context/sidebar-context";
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isOpen } = useSidebar();
  return (
    <div className='flex gap-4 h-screen bg-background'>
      <Sidebar />

      {/* Main Content */}
      <main
        className={`flex-grow transition-layout ${
          isOpen ? "w-[80vw]" : "w-[95vw]"
        } max-h-screen overflow-y-auto scroll-smooth p-4`}
      >
        {children}
      </main>
    </div>
  );
}
