"use client";

import { useChat } from "@ai-sdk/react";
import { Send, Bot, User, Loader2, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function Chat() {
    const { messages, append, isLoading } = useChat({
        api: "/api/chat",
        onError: (error: any) => {
            console.error("Chat error:", error);
        },
    }) as any;

    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input;
        setInput("");

        await append({
            role: "user",
            content: userMessage,
        });
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const toggleTool = (toolCallId: string) => {
        setExpandedTools((prev) => ({
            ...prev,
            [toolCallId]: !prev[toolCallId],
        }));
    };

    return (
        <div className="flex flex-col w-full h-[80vh] bg-zinc-900/50 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden backdrop-blur-sm">
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b border-zinc-800 bg-zinc-900/80">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                    <Bot className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h2 className="font-semibold text-zinc-100">AI Assistant</h2>
                    <p className="text-xs text-zinc-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Online & Ready
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
                        <Sparkles className="w-12 h-12 text-zinc-700" />
                        <p>Ask me anything about your documents...</p>
                    </div>
                )}

                {messages.map((m: any) => (
                    <div
                        key={m.id}
                        className={cn(
                            "flex gap-4 max-w-3xl mx-auto",
                            m.role === "user" ? "justify-end" : "justify-start"
                        )}
                    >
                        {m.role === "assistant" && (
                            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot className="w-5 h-5 text-blue-400" />
                            </div>
                        )}

                        <div className="flex flex-col gap-2 max-w-[80%]">
                            {/* Tool Invocations (Thinking Process) */}
                            {m.toolInvocations?.map((toolInvocation: any) => {
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
                            {m.content && (
                                <div
                                    className={cn(
                                        "p-4 rounded-2xl shadow-sm",
                                        m.role === "user"
                                            ? "bg-blue-600 text-white rounded-br-none"
                                            : "bg-zinc-800 text-zinc-100 rounded-bl-none border border-zinc-700"
                                    )}
                                >
                                    <p className="whitespace-pre-wrap leading-relaxed">
                                        {m.content}
                                    </p>
                                </div>
                            )}
                        </div>

                        {m.role === "user" && (
                            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0 mt-1">
                                <User className="w-5 h-5 text-zinc-300" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-4 max-w-3xl mx-auto justify-start">
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="bg-zinc-800 p-4 rounded-2xl rounded-bl-none border border-zinc-700 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                            <span className="text-sm text-zinc-400">Thinking...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-zinc-900/80 border-t border-zinc-800">
                <form
                    onSubmit={handleSubmit}
                    className="max-w-3xl mx-auto relative flex items-center gap-2"
                >
                    <input
                        className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-zinc-500 transition-all"
                        value={input || ""}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input?.trim()}
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/20"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
                <p className="text-center text-xs text-zinc-600 mt-2">
                    AI can make mistakes. Please verify important information.
                </p>
            </div>
        </div>
    );
}
