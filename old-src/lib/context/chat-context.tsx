"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ChatContextType {
  newChatData: any;
  setNewChatData: (data: any) => void;
  language: string;
  setLanguage: (language: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [newChatData, setNewChatData] = useState<any>(null);
  const [language, setLanguage] = useState<string>("en");

  return (
    <ChatContext.Provider
      value={{
        newChatData,
        setNewChatData,
        language,
        setLanguage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
