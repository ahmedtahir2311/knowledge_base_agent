"use client";

import { useChat } from "@ai-sdk/react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function Chat() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat() as any;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                        <Bot className="w-12 h-12 mb-2 opacity-20" />
                        <p>Ask questions about your documents</p>
                    </div>
                )}

                {messages.map((m: any) => (
                    <div
                        key={m.id}
                        className={cn(
                            "flex gap-3 max-w-[80%]",
                            m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                    >
                        <div
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                m.role === "user" ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600"
                            )}
                        >
                            {m.role === "user" ? (
                                <User className="w-5 h-5" />
                            ) : (
                                <Bot className="w-5 h-5" />
                            )}
                        </div>
                        <div
                            className={cn(
                                "p-3 rounded-lg text-sm",
                                m.role === "user"
                                    ? "bg-blue-600 text-white"
                                    : "bg-zinc-100 text-zinc-800"
                            )}
                        >
                            {m.content}
                            {/* Show tool invocations if any (optional, usually hidden for end users but good for debug) */}
                            {m.toolInvocations?.map((toolInvocation: any) => {
                                const { toolName, toolCallId, state } = toolInvocation;

                                if (state === 'result') {
                                    return (
                                        <div key={toolCallId} className="mt-2 text-xs opacity-70 border-t border-zinc-200 pt-2">
                                            {'result' in toolInvocation ? (
                                                <span>Found relevant info in knowledge base</span>
                                            ) : null}
                                        </div>
                                    )
                                }
                                return (
                                    <div key={toolCallId} className="mt-2 text-xs opacity-70 animate-pulse">
                                        Searching knowledge base...
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-3 mr-auto max-w-[80%]">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                            <Bot className="w-5 h-5 text-zinc-600" />
                        </div>
                        <div className="p-3 rounded-lg bg-zinc-100">
                            <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-200 bg-zinc-50">
                <div className="flex gap-2">
                    <input
                        className="flex-1 p-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={input || ""}
                        onChange={handleInputChange}
                        placeholder="Type your question..."
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input?.trim()}
                        className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
