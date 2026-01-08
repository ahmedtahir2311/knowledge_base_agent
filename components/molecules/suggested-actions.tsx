"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { memo } from "react";
import type { ChatMessage } from "@/lib/types";
import { Suggestion } from "./suggestion-item";
import type { VisibilityType } from "./visibility-selector";
import { Button } from "@/components/atoms/button";

type SuggestedActionsProps = {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  selectedVisibilityType: VisibilityType;
};

function PureSuggestedActions({ chatId, sendMessage }: SuggestedActionsProps) {
  const suggestedActions = [
    "Is Dubai real estate actually a good investment right now, or is the market overheated?",
    "Should I invest in off-plan properties or ready-to-move units in Dubai?",
    "What return on investment should I realistically expect from Dubai property?",
    "How much capital do I need to start investing in Dubai real estate?",
    "What are the biggest risks investors overlook when buying property in Dubai?",
    "How do smart investors choose the right area or community in Dubai?",
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
            onSuggestionClick={(suggestion) => {
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
