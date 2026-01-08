"use client";
import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { memo, useState } from "react";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { cn, sanitizeText } from "@/lib/utils";
import { useDataStream } from "@/context/data-stream-provider";
import { MessageContent } from "@/components/molecules/message-parts";
import { Response } from "@/components/molecules/markdown-response";
import { SparklesIcon } from "lucide-react";
import { MessageActions } from "@/components/molecules/message-actions";
import { MessageEditor } from "./message-editor";
import { MessageReasoning } from "./message-reasoning";

const PurePreviewMessage = ({
  addToolApprovalResponse,
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
  requiresScrollPadding: _requiresScrollPadding,
}: {
  addToolApprovalResponse: UseChatHelpers<ChatMessage>["addToolApprovalResponse"];
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  useDataStream();

  return (
    <div
      className='group/message fade-in w-full animate-in duration-200'
      data-role={message.role}
      data-testid={`message-${message.role}`}
    >
      <div
        className={cn("flex w-full items-start gap-2 md:gap-3", {
          "justify-end": message.role === "user" && mode !== "edit",
          "justify-start": message.role === "assistant",
        })}
      >
        {message.role === "assistant" && (
          <div className='-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border'>
            <SparklesIcon size={14} />
          </div>
        )}

        <div
          className={cn("relative flex flex-col", {
            "gap-2 md:gap-4": message.parts?.some(
              (p) => p.type === "text" && p.text?.trim()
            ),
            "w-full":
              (message.role === "assistant" &&
                (message.parts?.some(
                  (p) => p.type === "text" && p.text?.trim()
                ) ||
                  message.parts?.some((p) => p.type.startsWith("tool-")))) ||
              mode === "edit",
            "max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]":
              message.role === "user" && mode !== "edit",
          })}
        >
          {message.parts?.map((part, index) => {
            const { type } = part;
            const key = `message-${message.id}-part-${index}`;

            // Inject fake reasoning if this is the first part, we are loading, and no reasoning part exists
            if (
              index === 0 &&
              isLoading &&
              !message.parts.some((p) => p.type === "reasoning")
            ) {
              return (
                <div key={key + "-fake-reasoning"}>
                  <MessageReasoning
                    isLoading={true}
                    reasoning='Analysis in progress...'
                  />
                  {type === "text" && mode === "view" ? (
                    <div key={key}>
                      <MessageContent
                        className={cn({
                          "wrap-break-word w-fit rounded-2xl px-3 py-2 text-right text-white":
                            message.role === "user",
                          "bg-transparent px-0 py-0 text-left":
                            message.role === "assistant",
                        })}
                        data-testid='message-content'
                        style={
                          message.role === "user"
                            ? { backgroundColor: "#006cff" }
                            : undefined
                        }
                      >
                        <Response
                          className={cn({
                            "text-white prose-p:text-white prose-headings:text-white prose-li:text-white prose-strong:text-white prose-code:text-white prose-a:text-white prose-blockquote:text-white prose-td:text-white prose-th:text-white prose-tr:text-white":
                              message.role === "user",
                          })}
                        >
                          {sanitizeText(part.text)}
                        </Response>
                      </MessageContent>
                    </div>
                  ) : null}
                </div>
              );
            }

            if (type === "reasoning" && part.text?.trim().length > 0) {
              return (
                <MessageReasoning
                  isLoading={isLoading}
                  key={key}
                  reasoning={part.text}
                />
              );
            }

            if (type === "text") {
              if (mode === "view") {
                return (
                  <div key={key}>
                    <MessageContent
                      className={cn({
                        "wrap-break-word w-fit rounded-2xl px-3 py-2 text-right text-white":
                          message.role === "user",
                        "bg-transparent px-0 py-0 text-left":
                          message.role === "assistant",
                      })}
                      data-testid='message-content'
                      style={
                        message.role === "user"
                          ? { backgroundColor: "#006cff" }
                          : undefined
                      }
                    >
                      <Response
                        className={cn({
                          "text-white prose-p:text-white prose-headings:text-white prose-li:text-white prose-strong:text-white prose-code:text-white prose-a:text-white prose-blockquote:text-white prose-td:text-white prose-th:text-white prose-tr:text-white":
                            message.role === "user",
                        })}
                      >
                        {sanitizeText(part.text)}
                      </Response>
                    </MessageContent>
                  </div>
                );
              }

              if (mode === "edit") {
                return (
                  <div
                    className='flex w-full flex-row items-start gap-3'
                    key={key}
                  >
                    <div className='size-8' />
                    <div className='min-w-0 flex-1'>
                      <MessageEditor
                        key={message.id}
                        message={message}
                        regenerate={regenerate}
                        setMessages={setMessages}
                        setMode={setMode}
                      />
                    </div>
                  </div>
                );
              }
            }

            return null;
          })}

          {!isReadonly && (
            <MessageActions
              chatId={chatId}
              isLoading={isLoading}
              key={`action-${message.id}`}
              message={message}
              setMode={setMode}
              vote={vote}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.message.id === nextProps.message.id &&
      prevProps.requiresScrollPadding === nextProps.requiresScrollPadding &&
      equal(prevProps.message.parts, nextProps.message.parts) &&
      equal(prevProps.vote, nextProps.vote)
    ) {
      return true;
    }
    return false;
  }
);

export const ThinkingMessage = () => {
  return (
    <div
      className='group/message fade-in w-full animate-in duration-300'
      data-role='assistant'
      data-testid='message-assistant-loading'
    >
      <div className='flex items-start justify-start gap-3'>
        <div className='-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border'>
          <div className='animate-pulse'>
            <SparklesIcon size={14} />
          </div>
        </div>

        <div className='flex w-full flex-col gap-2 md:gap-4'>
          <div className='flex items-center gap-1 p-0 text-muted-foreground text-sm'>
            <span className='animate-pulse'>Cooking up your answer</span>
            <span className='inline-flex'>
              <span className='animate-bounce [animation-delay:0ms]'>.</span>
              <span className='animate-bounce [animation-delay:150ms]'>.</span>
              <span className='animate-bounce [animation-delay:300ms]'>.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
