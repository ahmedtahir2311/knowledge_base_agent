"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { memo } from "react";
import type { ChatMessage } from "@/lib/types";
import { Suggestion } from "./elements/suggestion";
import type { VisibilityType } from "./visibility-selector";

type SuggestedActionsProps = {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  selectedVisibilityType: VisibilityType;
};

function PureSuggestedActions({ chatId, sendMessage }: SuggestedActionsProps) {
  const suggestedActions = [
    "What are the advantages of using Next.js",
    "Write code to demonstrate Dijkstra's algorithm",
    "Help me write an essay about Silicon Valley.",
    "What is the weather in San Francisco and New York",
    "Explain in detail the theory of relativity",
    "Draft a packing list for a trip to Japan",
  ];

  return (
    <div
      className='fixed top-1/2 left-1/2 z-10 grid w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 gap-4 px-4 sm:grid-cols-3'
      data-testid='suggested-actions'
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          initial={{ opacity: 0, y: 20 }}
          key={suggestedAction}
          transition={{ delay: 0.05 * index }}
        >
          <Suggestion
            className='flex h-auto w-full flex-col items-start justify-start rounded-xl border bg-background p-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent/50 hover:shadow-md whitespace-normal break-words'
            onClick={(suggestion) => {
              window.history.pushState({}, "", `/chat/${chatId}`);
              sendMessage({
                role: "user",
                parts: [{ type: "text", text: suggestion }],
              });
            }}
            suggestion={suggestedAction}
          >
            <span className='text-left'>{suggestedAction}</span>
          </Suggestion>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) {
      return false;
    }
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
      return false;
    }

    return true;
  }
);
