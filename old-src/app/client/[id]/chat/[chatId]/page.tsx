"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import { convertToUIMessages } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { Chat } from "@/components/organisms/chat";
import { Loader2 } from "lucide-react";

export default function ChatHistory({
  params,
}: {
  params: Promise<{ id: string; chatId: string }>;
}) {
  const { id: clientId, chatId } = use(params);
  const router = useRouter();
  const [chat, setChat] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const newId = uuidv4();

  async function loadChat() {
    try {
      setLoading(true);
      const data = await fetch(`/api/chat/${chatId}?clientId=${clientId}`);
      const chatFromDb = await data.json();

      setChat({
        ...chatFromDb.chat,
        messages: convertToUIMessages(
          JSON.parse(chatFromDb.chat?.messages) || []
        ),
      });
    } catch (error) {
      console.error("Error loading chat:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (clientId && chatId && chatId !== "new") {
      loadChat();
    }
  }, [chatId, clientId, router]);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Loader2 className='h-[20px] w-[20px] animate-spin' />
      </div>
    );
  }

  return (
    <div className=''>
      <Chat
        key={chatId === "new" ? newId : chatId}
        id={chatId === "new" ? newId : chatId}
        clientId={clientId}
        initialMessages={chatId === "new" ? [] : chat?.messages || []}
      />
    </div>
  );
}
