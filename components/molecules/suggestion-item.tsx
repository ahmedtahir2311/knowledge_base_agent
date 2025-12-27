"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

export type SuggestionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  suggestion: string;
  onSuggestionClick?: (suggestion: string) => void;
};

export const Suggestion = forwardRef<HTMLButtonElement, SuggestionProps>(
  (
    { className, suggestion, children, onClick, onSuggestionClick, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex w-full cursor-pointer flex-col items-start gap-1 rounded-xl border bg-background p-3 text-sm transition-colors hover:bg-muted",
          className
        )}
        onClick={(e) => {
          onClick?.(e);
          onSuggestionClick?.(suggestion);
        }}
        type='button'
        {...props}
      >
        {children || suggestion}
      </button>
    );
  }
);
Suggestion.displayName = "Suggestion";
