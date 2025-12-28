"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { useWindowSize } from "usehooks-ts";
import { Button } from "@/components/atoms/button";
import { PlusIcon } from "lucide-react";
import { useSidebar } from "@/components/organisms/sidebar";
import { type VisibilityType } from "@/components/molecules/visibility-selector";

function PureChatHeader({
  chatId,
  isReadonly,
}: {
  chatId: string;
  isReadonly: boolean;
}) {
  const router = useRouter();
  const { open } = useSidebar();

  const { width: windowWidth } = useWindowSize();

  return (
    <header className='sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2'>
      {(!open || windowWidth < 768) && (
        <Button
          className='order-2 ml-auto h-8 px-2 md:order-1 md:ml-0 md:h-fit md:px-2'
          onClick={() => {
            router.push("/");
            router.refresh();
          }}
          variant='outline'
        >
          <PlusIcon />
          <span className='md:sr-only'>New Chat</span>
        </Button>
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.isReadonly === nextProps.isReadonly
  );
});
