import { UseChatHelpers } from "@ai-sdk/react";
import { UIMessage } from "ai";
import { LoaderCircle } from "lucide-react";
import React, { useCallback, useRef, useState, useEffect } from "react";
import BotMessage from "@/components/organisms/bot-message";
import { UserMessage } from "@/components/organisms/user-message";
import ReasoningMessagePart from "@/components/organisms/reasoning-component";
import StaterConversation from "@/components/atoms/starter-boxes";
import { ExtendedMessage } from "@/lib/types";
import Analyzer from "../atoms/analyzer";
interface MessagesProps {
  messages: Array<UIMessage>;
  status: UseChatHelpers["status"];
  handleFormSubmit: (e?: React.FormEvent) => Promise<void>;
  setInput: (value: string) => void;
  input: string;
  textStatus?: string;
}

const Messages = ({
  messages,
  status,
  handleFormSubmit,
  setInput,
  input,
  textStatus,
}: MessagesProps) => {
  const [promptClicked, setPromptClicked] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent, prompt: string) => {
      e.preventDefault();
      // Set the input value to the prompt
      setInput(prompt);
      // Set a flag to indicate that a prompt was clicked
    },
    [setInput]
  );

  useEffect(() => {
    if (promptClicked) {
      // Call handleFormSubmit once the input is set
      handleFormSubmit();
      // Reset the flag
      setPromptClicked(false);
    }
  }, [input, promptClicked]);

  return (
    <div
      ref={messagesContainerRef}
      className='flex-1 overflow-y-auto space-y-4 pb-4 xs:px-[20px] lg:px-[200px]'
      style={{
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
    >
      {messages.length === 0 ? (
        <div className='flex flex-col items-center justify-center h-full'>
          <StaterConversation handleClick={handleClick} />
        </div>
      ) : (
        messages.map((message) =>
          message.parts.map((part, partIndex) => {
            if (part.type === "text" && message.role === "user" && part.text) {
              return (
                <UserMessage
                  key={`${message.id}-${partIndex}`}
                  message={part.text}
                  isLastUserMessage={false}
                  handleUserEditMessages={() => {}}
                />
              );
            }

            if (part.type === "reasoning") {
              return (
                <ReasoningMessagePart
                  key={`${message.id}-${partIndex}`}
                  // @ts-expect-error export ReasoningUIPart
                  part={part}
                  isReasoning={
                    status === "streaming" &&
                    partIndex === message.parts.length - 1
                  }
                />
              );
            }
            if (
              part.type === "text" &&
              message.role === "assistant" &&
              part.text
            ) {
              // Check if this message has saved reasoning data
              const extendedMessage = message as unknown as ExtendedMessage;
              const savedReasoning = extendedMessage.reasoning;

              // If there's saved reasoning and no reasoning part already displayed
              const hasReasoningPart = message.parts.some(
                (p) => p.type === "reasoning"
              );

              if (savedReasoning && !hasReasoningPart) {
                // First render the reasoning component with saved data
                return (
                  <React.Fragment key={`${message.id}-${partIndex}`}>
                    <ReasoningMessagePart
                      key={`${message.id}-reasoning`}
                      part={{ type: "text", text: "" }}
                      isReasoning={false}
                      savedReasoning={savedReasoning}
                    />
                    <BotMessage
                      key={`${message.id}-text`}
                      content={part.text}
                      isStreaming={status === "streaming"}
                    />
                  </React.Fragment>
                );
              }

              return (
                <BotMessage
                  key='message'
                  content={part.text}
                  isStreaming={status === "streaming"}
                />
              );
            }
          })
        )
      )}

      {(status === "streaming" || status === "submitted") && !textStatus && (
        <LoaderCircle className='h-4 w-4 animate-spin' />
      )}

      {(status === "streaming" || status === "submitted") && textStatus && (
        <Analyzer
          type='streaming'
          headTitle={textStatus}
          details={{
            assistantType: "assistant",
            text: "Please wait while we process your query...",
          }}
        />
      )}
    </div>
  );
};

export default Messages;
