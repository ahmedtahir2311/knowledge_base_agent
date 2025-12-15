"use client";

import { useChat } from "@ai-sdk/react";
import { Bot } from "lucide-react";
import { ChatMessages } from "./chat/chat-messages";
import { ChatInput } from "./chat/chat-input";
import { DefaultChatTransport } from "ai";

export default function Chat() {
    const { messages, sendMessage, status, stop } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat',
        }),
    });

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
            <ChatMessages messages={messages} isLoading={false} />

            {/* Input Area */}
            <ChatInput onSend={sendMessage} status={status} />
        </div>
    );
}
