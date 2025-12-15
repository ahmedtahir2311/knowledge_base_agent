"use client";

import { useRef, useEffect } from "react";
import { MessageBubble } from "./message-bubble";
import { Sparkles, Bot, Loader2 } from "lucide-react";

interface ChatMessagesProps {
    messages: any[];
    isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
                    <Sparkles className="w-12 h-12 text-zinc-700" />
                    <p>Ask me anything about your documents...</p>
                </div>
            )}

            {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-4 max-w-3xl mx-auto justify-start w-full">
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
    );
}
