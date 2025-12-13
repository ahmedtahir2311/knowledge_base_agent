"use client";

// import { BotMessage } from "@/components/bot-message";
// import { UserMessage } from "@/components/user-message";
// import Analyzer from "../analyzer";

// Resolved
import type { Message, ToolCall } from "ai";
import { useChat } from "@ai-sdk/react";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Textarea from "react-textarea-autosize";
import { useChatContext } from "@/lib/context/chat-context";
import Messages from "./messages";

export function Chat({
  id,
  clientId,
  initialMessages,
}: {
  id: string;
  clientId: string;
  initialMessages: Array<Message>;
}) {
  const { setNewChatData, language } = useChatContext();
  const { user, isSignedIn } = useUser();
  const [isEdited, setEdited] = useState(false);
  const [textStatus, setTextStatus] = useState("Processing User Query...");
  const router = useRouter();

  const {
    messages,
    input,
    setInput,
    handleSubmit: processUserMessage,
    status,
    data,
  } = useChat({
    id,
    initialMessages,
    body: {
      clientId: clientId,
      chatId: id,
      userId: user?.id || "anonymous",
      language,
      isEdited,
    },
    headers: {
      "Content-Type": "application/json",
    },
    onToolCall({ toolCall }) {
      handleToolCall(toolCall);
    },
    onResponse: (response) => {
      console.log({ response });
    },
    onError: (error) => {
      console.error("Chat API error:", error);
    },
  });

  const isGeneratingResponse = ["streaming", "submitted"].includes(status);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleFormSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Process the message but don't update URL yet
    await processUserMessage(e);

    setEdited(false);
  };

  const handleToolCall = (toolCall: any) => {
    if (toolCall.toolName === "list_files") {
      setTextStatus("Searching for relevant documents...");
    }
    if (toolCall.toolName === "read_files") {
      const fileName = toolCall.args.fileLink.split("/").pop();
      setTextStatus(`Analyzing ${fileName} Contents...`);
    }
  };

  // Getting New Chat in Side Bar when it Start Streaming
  useEffect(() => {
    if (status === "streaming") {
      setNewChatData(id);
    }

    // Update the URL once the chat is saved and complete
    // Only update URL when streaming has finished and we're back to ready state
    if (status === "ready" && messages.length > 1) {
      router.replace(`/client/${clientId}/chat/${id}`);
    }
  }, [id, setNewChatData, status, messages.length, router]);

  return (
    <div className='flex justify-center items-start w-full h-[calc(100vh-165px)] mt-3'>
      <section className='flex-1 relative w-full h-full flex flex-col'>
        <Messages
          messages={messages}
          status={status}
          handleFormSubmit={handleFormSubmit}
          setInput={setInput}
          input={input}
          textStatus={textStatus}
        />

        <section className='sticky bottom-0 left-0 right-0 w-full max-w-[65vw] mx-auto p-4 pt-0 pb-0 backdrop-blur-sm'>
          <div className='w-full relative'>
            <form
              onSubmit={handleFormSubmit}
              className='relative w-full flex justify-center items-center gap-[10px] mb-[10px]'
            >
              {isSignedIn ? (
                <Textarea
                  ref={inputRef}
                  name='input'
                  rows={1}
                  maxRows={5}
                  tabIndex={0}
                  placeholder='Ask a question...'
                  spellCheck={false}
                  value={input}
                  className='w-full resize-none text-gray-800  min-h-[41px] max-h-36 rounded-[50px] bg-secondary border-0 border-input py-[10px] px-[20px] text-sm  file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 scrollbar-hide pr-[40px]'
                  onChange={(e: any) => {
                    setInput(e.target.value);
                  }}
                  onKeyDown={(e: any) => {
                    // Enter should submit the form
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing &&
                      !isGeneratingResponse
                    ) {
                      // Prevent the default action to avoid adding a new line
                      if (input.trim().length === 0) {
                        e.preventDefault();
                        return;
                      }
                      e.preventDefault();
                      const textarea = e.target as HTMLTextAreaElement;
                      textarea.form?.requestSubmit();
                    }
                  }}
                  onHeightChange={(height: any) => {
                    // Ensure inputRef.current is defined
                    if (!inputRef.current) return;

                    // The initial height and left padding is 70px and 2rem
                    const initialHeight = 70;
                    // The initial border radius is 32px
                    const initialBorder = 32;
                    // The height is incremented by multiples of 20px
                    const multiple = (height - initialHeight) / 20;

                    // Decrease the border radius by 4px for each 20px height increase
                    const newBorder = initialBorder - 4 * multiple;
                    // The lowest border radius will be 8px
                    inputRef.current.style.borderRadius =
                      Math.max(8, newBorder) + "px";
                  }}
                />
              ) : (
                <div className='mb-4 p-4 bg-red-700/10  border border-red-700 rounded-lg text-center'>
                  <p className='text-red-700 font-medium'>
                    Please log in to continue with the chat
                  </p>
                </div>
              )}

              <button
                type='submit'
                className={` font-poppins py-[10px] px-[20px]  text-white text-[14px] rounded-[90px] h-[40px] w-[76px] flex justify-center items-center ${
                  input.length === 0 ? "cursor-not-allowed" : "cursor-pointer"
                } bg-primary`}
                disabled={input.length === 0 || isGeneratingResponse}
              >
                {isGeneratingResponse ? (
                  <LoaderCircle className='h-4 w-4 animate-spin' />
                ) : (
                  "Send"
                )}
              </button>
            </form>
          </div>
        </section>
      </section>
    </div>
  );
}
