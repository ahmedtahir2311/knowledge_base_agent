import { cookies } from "next/headers";
import Script from "next/script";
import { Suspense } from "react";
import { AppSidebar } from "@/components/templates/app-sidebar";
import { DataStreamProvider } from "@/context/data-stream-provider";
import { SidebarInset, SidebarProvider } from "@/components/organisms/sidebar";
import { auth } from "../(auth)/auth";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        src='https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js'
        strategy='beforeInteractive'
      />
      <DataStreamProvider>
        <Suspense fallback={<div className='flex h-dvh' />}>
          <SidebarWrapper>{children}</SidebarWrapper>
        </Suspense>
      </DataStreamProvider>
    </>
  );
}

async function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  // Sidebar open by default - only close if explicitly set to false
  // const isCollapsed = cookieStore.get("sidebar_state")?.value === "false";

  return (
    <SidebarProvider defaultOpen={false} open={false}>
      <AppSidebar user={session?.user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
