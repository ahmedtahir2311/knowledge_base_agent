"use client";

import { Send } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
    onSend: any
    status: string;
}

export function ChatInput({ onSend, status }: ChatInputProps) {
    const [input, setInput] = useState("");

    return (
        <div className="p-4 bg-zinc-900/80 border-t border-zinc-800">
            <form
                onSubmit={e => {
                    e.preventDefault();
                    if (input.trim()) {
                        onSend({ text: input });
                        setInput('');
                    }
                }}

                className="max-w-3xl mx-auto relative flex items-center gap-2"
            >
                <input
                    className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-zinc-500 transition-all"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={status !== 'ready'}
                    placeholder="Say something..."
                    autoFocus
                />
                <button
                    type="submit" disabled={status !== 'ready'}

                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/20"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
            <p className="text-center text-xs text-zinc-600 mt-2">
                AI can make mistakes. Please verify important information.
            </p>
        </div>
    );
}
