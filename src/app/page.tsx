"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Paperclip, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

// Editorial / Human Style UI
// Vibe: A quiet room, a typewriter, a conversation.
// Font: Newsreader (Serif).
// Colors: Warm, muted, paper-like.

export default function Home() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Persistence
  const initialMessages = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem("chat_messages") || "[]") 
    : [];

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading, setMessages, append } = useChat({
    api: "/api/chat",
    initialMessages,
  });

  useEffect(() => {
    if (messages.length > 0) {
        localStorage.setItem("chat_messages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    setIsClient(true);
    // Relaxed scrolling
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [files, setFiles] = useState<File[]>([]);
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };
  const removeFile = (index: number) => setFiles(files.filter((_, i) => i !== index));

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && files.length === 0) return;
    handleSubmit(e);
    setFiles([]);
  };

  // Conversation Starters
  const starters = [
    { title: "Explain Quantum Physics", prompt: "Explain quantum physics to me like I'm 5 years old." },
    { title: "Debug Python Code", prompt: "I have a Python script that's throwing a recursion error. Can you help me debug it?" },
    { title: "Write a Haiku", prompt: "Write a haiku about artificial intelligence." },
    { title: "Plan a Trip", prompt: "Plan a 3-day itinerary for a trip to Kyoto, Japan, focusing on food and history." },
    { title: "Draft an Email", prompt: "Draft a professional email creating a meeting agenda for a project kickoff." },
    { title: "Gift Ideas", prompt: "Suggest 5 unique gift ideas for someone who loves gardening and technology." },
  ];

  if (!isClient) return null; 

  return (
    <main className="bg-page min-h-screen w-full flex flex-col items-center text-slate-50 font-main selection:bg-blue-500/30 selection:text-white relative">
        
        {/* Header - Transparent Spacer */}
        <div className="w-full h-16" />

        {/* Content Area */}
        <div className="flex-1 w-full max-w-3xl px-4 pb-48 flex flex-col justify-center">
            {messages.length === 0 ? (
                // Empty State with Starters
                <div className="flex flex-col items-center justify-center gap-12 -mt-20">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-blue-500/20">
                            <span className="text-3xl">✨</span>
                        </div>
                        <h1 className="text-3xl font-semibold text-white tracking-tight">
                            How can I help you today?
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Choose a conversation starter or type your own.
                        </p>
                    </div>
                
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {starters.map((starter, i) => (
                            <button 
                                key={i}
                                onClick={() => append({ role: 'user', content: starter.prompt })}
                                className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 transition-all text-left flex flex-col gap-1 group"
                            >
                                <span className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">
                                    {starter.title}
                                </span>
                                <span className="text-sm text-slate-500 line-clamp-1">
                                    {starter.prompt}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                // Chat Messages
                <div className="space-y-12">
                    {messages.map((m, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            key={m.id} 
                        >
                            {m.role === 'user' ? (
                                // User: Bold Header
                                <div className="mb-4 pl-4 border-l-2 border-blue-500">
                                    <h2 className="text-xl font-semibold text-white leading-snug tracking-tight">
                                        {m.content}
                                    </h2>
                                </div>
                            ) : (
                                // AI: Body Text
                                <div className="prose prose-invert prose-p:text-slate-300 prose-p:leading-7 prose-headings:text-blue-400 prose-strong:text-blue-400 prose-li:text-slate-300 max-w-none">
                                    <ReactMarkdown>{m.content}</ReactMarkdown>
                                </div>
                            )}
                        </motion.div>
                    ))}
                
                    {isLoading && (
                         <div className="flex items-center gap-3 text-slate-500 mt-8 ml-4">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75" />
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150" />
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}
        </div>

        {/* Floating Input Area */}
        <div className="fixed bottom-8 w-full px-4 flex justify-center z-10">
            <div className="w-full max-w-3xl flex flex-col gap-2">
                 {/* File Tags (Floating above input) */}
                 {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-4">
                         {files.map((file, i) => (
                            <div key={i} className="flex items-center gap-2 bg-slate-800 text-blue-400 px-3 py-1 rounded-full text-sm border border-slate-700 shadow-sm">
                                <span>{file.name}</span>
                                <button onClick={() => removeFile(i)} className="hover:text-red-400"><X className="w-3 h-3"/></button>
                            </div>
                        ))}
                    </div>
                )}

                <form 
                    onSubmit={onFormSubmit} 
                    className="relative flex items-center gap-2 p-2 bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl ring-1 ring-white/5"
                >
                    {/* Left: Attachment */}
                    <div className="flex-shrink-0 ml-1">
                         <button
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all rounded-xl"
                            title="Attach"
                        >
                            <Paperclip className="w-5 h-5" />
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect}/>
                    </div>

                    {/* Center: Input */}
                    <input 
                        className="flex-1 bg-transparent text-lg py-3 px-2 text-white placeholder-slate-500 focus:outline-none font-medium"
                        placeholder="Message..."
                        value={input}
                        onChange={handleInputChange}
                        autoFocus
                    />
                    
                    {/* Right: Send */}
                    <div className="flex-shrink-0 mr-1">
                        <button 
                            type="submit" 
                            disabled={!input.trim() && files.length === 0}
                            className="p-3 bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-blue-900/20"
                        >
                            <ArrowUp className="w-5 h-5" />
                        </button>
                    </div>
                </form>
                
                {/* Footer Note */}
                <div className="text-center">
                    <p className="text-xs text-slate-600">
                        AI can make mistakes. Check important info.
                    </p>
                </div>
            </div>
        </div>

    </main>
  );
}
