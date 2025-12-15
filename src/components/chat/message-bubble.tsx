
import { cn } from "@/lib/utils";
import { Bot, User, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";

import MemoizedReactMarkdown from "@/components/atoms/markdown";
import { markdownComponents } from "./markdown-replacement";

interface MessageBubbleProps {
    message: any;
}

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

export function MessageBubble({ message }: MessageBubbleProps) {
    const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});

    const toggleTool = (toolCallId: string) => {
        setExpandedTools((prev) => ({
            ...prev,
            [toolCallId]: !prev[toolCallId],
        }));
    };

    const isUser = message.role === "user";

    const processedContent = useMemo(() => {
        return preprocessLaTeX(message.content || "");
    }, [message.content]);

    return (
        <div
            className={cn(
                "flex gap-4 max-w-3xl mx-auto w-full",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-5 h-5 text-blue-400" />
                </div>
            )}

            <div className="flex flex-col gap-2 max-w-[80%]">
                {/* Tool Invocations (Thinking Process) */}
                {message.toolInvocations?.map((toolInvocation: any) => {
                    const isExpanded = expandedTools[toolInvocation.toolCallId];
                    const isComplete = toolInvocation.state === "result";

                    return (
                        <div
                            key={toolInvocation.toolCallId}
                            className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden text-sm"
                        >
                            <button
                                onClick={() => toggleTool(toolInvocation.toolCallId)}
                                className="w-full flex items-center gap-2 p-2 hover:bg-zinc-800/50 transition-colors text-zinc-400"
                            >
                                {isComplete ? (
                                    <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                    </div>
                                ) : (
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                )}
                                <span className="font-mono text-xs">
                                    {toolInvocation.toolName === "retrieveKnowledge"
                                        ? "Searching Knowledge Base..."
                                        : "Processing..."}
                                </span>
                                {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 ml-auto" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 ml-auto" />
                                )}
                            </button>

                            {isExpanded && (
                                <div className="p-3 bg-zinc-950 border-t border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto">
                                    <div className="mb-2">
                                        <span className="text-zinc-500">Query:</span>{" "}
                                        <span className="text-blue-300">
                                            {toolInvocation.args.query}
                                        </span>
                                    </div>
                                    {isComplete && (
                                        <div>
                                            <span className="text-zinc-500">Result:</span>
                                            <pre className="mt-1 text-zinc-400 whitespace-pre-wrap">
                                                {JSON.stringify(toolInvocation.result, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Message Content */}
                {message.content && (
                    <div
                        className={cn(
                            "p-4 rounded-2xl shadow-sm overflow-hidden",
                            isUser
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-zinc-800 text-zinc-100 rounded-bl-none border border-zinc-700"
                        )}
                    >
                        <div className={cn("prose prose-sm max-w-none break-words", isUser ? "prose-invert" : "prose-invert dark:prose-invert")}>
                            <MemoizedReactMarkdown
                                rehypePlugins={[rehypeKatex, rehypeRaw]}
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                            >
                                {processedContent}
                            </MemoizedReactMarkdown>
                        </div>
                    </div>
                )}
            </div>

            {isUser && (
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-5 h-5 text-zinc-300" />
                </div>
            )}
        </div>
    );
}
