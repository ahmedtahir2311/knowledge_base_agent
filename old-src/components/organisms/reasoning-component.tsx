import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ChevronDownIcon, ChevronUpIcon, LoaderCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import MemoizedReactMarkdown from "@/components/atoms/markdown";
import { markdownComponents } from "@/components/organisms/markdown-replacement";

interface ReasoningPart {
  type: "reasoning";
  reasoning: string;
  details: Array<{ type: "text"; text: string }>;
}

interface ReasoningMessagePartProps {
  part: ReasoningPart | { type: "text"; text: string };
  isReasoning: boolean;
  savedReasoning?: string;
}

export default function ReasoningMessagePart({
  part,
  isReasoning,
  savedReasoning,
}: ReasoningMessagePartProps) {
  const [isExpanded, setIsExpanded] = useState(isReasoning || false);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: "auto",
      opacity: 1,
      marginTop: "1rem",
      marginBottom: 0,
    },
  };

  useEffect(() => {
    if (!isReasoning) {
      setIsExpanded(false);
    }
  }, [isReasoning]);

  // Determine if we have reasoning content to display
  const hasReasoning =
    (part.type === "reasoning" && part.details && part.details.length > 0) ||
    savedReasoning;

  // Get the content to display
  const getReasoningContent = () => {
    if (part.type === "reasoning" && part.details) {
      return part.details.map((detail, detailIndex) =>
        detail.type === "text" ? (
          <MemoizedReactMarkdown
            key={detailIndex}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
            components={markdownComponents}
          >
            {detail.text}
          </MemoizedReactMarkdown>
        ) : (
          "<redacted>"
        )
      );
    } else if (savedReasoning) {
      return (
        <MemoizedReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeKatex, rehypeRaw]}
          components={markdownComponents}
        >
          {savedReasoning}
        </MemoizedReactMarkdown>
      );
    }
    return null;
  };

  if (!hasReasoning) return null;

  return (
    <div className='flex flex-col'>
      {isReasoning ? (
        <div className='flex flex-row gap-2 items-center'>
          <div className='font-medium text-sm'>Thinking...</div>
          <LoaderCircle className='h-4 w-4 animate-spin' />
        </div>
      ) : (
        <div className='flex flex-row gap-2 items-center'>
          <div className='font-medium text-sm'>Thought for a few seconds</div>
          <button
            className={cn("cursor-pointer rounded-full ", {
              "": isExpanded,
            })}
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronDownIcon /> : <ChevronUpIcon />}
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key='reasoning'
            className='text-sm dark:text-zinc-400 text-zinc-600 flex flex-col gap-4 border-l pl-3 dark:border-zinc-800'
            initial='collapsed'
            animate='expanded'
            exit='collapsed'
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {getReasoningContent()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
