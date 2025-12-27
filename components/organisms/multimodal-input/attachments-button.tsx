"use client";

import { memo } from "react";
import { Button } from "@/components/atoms/button";
import { PaperclipIcon } from "lucide-react";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatMessage } from "@/lib/types";

function PureAttachmentsButton({
  fileInputRef,
  status,
  selectedModelId,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: UseChatHelpers<ChatMessage>["status"];
  selectedModelId: string;
}) {
  const isReasoningModel =
    selectedModelId.includes("reasoning") || selectedModelId.includes("think");

  return (
    <Button
      className='aspect-square h-8 rounded-lg p-1 transition-colors hover:bg-accent'
      data-testid='attachments-button'
      disabled={status !== "ready" || isReasoningModel}
      onClick={(event) => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      variant='ghost'
    >
      <PaperclipIcon size={14} style={{ width: 14, height: 14 }} />
    </Button>
  );
}

export const AttachmentsButton = memo(PureAttachmentsButton);
