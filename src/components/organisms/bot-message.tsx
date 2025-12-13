"use client";

import React, { useMemo } from "react";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { Bot } from "lucide-react";
import MemoizedReactMarkdown from "@/components/atoms/markdown";
import { markdownComponents } from "./markdown-replacement";

import "katex/dist/katex.min.css";

const preprocessLaTeX = (content: string): string => {
  // Process block LaTeX
  const blockProcessedContent = content.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_, equation) => `$$${equation}$$`
  );
  // Process inline LaTeX
  return blockProcessedContent.replace(
    /\\\(([\s\S]*?)\\\)/g,
    (_, equation) => `$${equation}$`
  );
};

interface BotMessageProps {
  content: string;
  isStreaming?: boolean;
}
const BotMessage = ({ content, isStreaming = false }: BotMessageProps) => {
  const processedContent = useMemo(() => {
    return preprocessLaTeX(content);
  }, [content]);
  // Render content
  return (
    <div className='flex gap-4 mb-6'>
      <Bot className='h-[24px] w-[24px] text-primary mt-2' />
      <div className='w-[90%] text-primary rounded-lg gap-3 overflow-hidden no-scrollbar '>
        <div className='prose-sm prose-neutral prose-a:text-accent-foreground/50'>
          <MemoizedReactMarkdown
            rehypePlugins={[rehypeKatex, rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {processedContent}
          </MemoizedReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default BotMessage;
