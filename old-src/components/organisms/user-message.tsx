"use client";

import { Check, CircleUser, Pencil, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

type UserMessageProps = {
  message?: string;
  handleUserEditMessages: (e: any, prompt?: string) => void;
  chatId?: string;
  messageId?: string;
  isLastUserMessage?: boolean;
};

export const UserMessage: React.FC<UserMessageProps> = ({
  message,
  isLastUserMessage = false,
  handleUserEditMessages,
}) => {
  const [editMessage, setEditMessage] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message);
  const pathname = usePathname();

  const isEditMessageAllowed = !pathname.includes("share");

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleUserEditMessages(e, editedMessage);
      setEditMessage(false);
    }
  };

  return (
    <div className='flex justify-end gap-3 mb-5'>
      <div className='flex justify-start items-center gap-3 max-w-[90%] group relative'>
        {isLastUserMessage && isEditMessageAllowed && !editMessage && (
          <div
            onClick={() => setEditMessage(!editMessage)}
            className='absolute -left-8 rounded-full p-1.5 cursor-pointer opacity-0 group-hover:opacity-100 hover:bg-secondary/50 transition-all duration-200'
          >
            <Pencil className='h-4 w-4 text-primary/70' />
          </div>
        )}

        <div
          className={cn(
            "flex bg-secondary rounded-2xl rounded-tr-sm py-3 px-5 shadow-sm",
            editMessage && "ring-1 ring-primary/20 shadow-md"
          )}
        >
          {isLastUserMessage && editMessage ? (
            <div className='flex justify-center items-center gap-3'>
              <p
                contentEditable
                onInput={(e) =>
                  setEditedMessage(e.currentTarget.textContent || "")
                }
                onKeyDown={handleKeyDown}
                className='border-none focus:outline-none font-poppins text-primary text-sm font-normal break-words min-w-[100px]'
              >
                {message}
              </p>
              <div className='flex justify-center items-center gap-2 ml-1'>
                <X
                  className='h-4 w-4 text-text-muted cursor-pointer hover:text-primary transition-colors'
                  onClick={() => setEditMessage(false)}
                />
                <Check
                  className={cn(
                    "h-4 w-4 transition-colors",
                    !editedMessage?.trim()
                      ? "text-text-muted cursor-not-allowed"
                      : "text-primary cursor-pointer hover:text-cta"
                  )}
                  onClick={(e) => {
                    if (editedMessage?.trim()) {
                      handleUserEditMessages(e, editedMessage);
                      setEditMessage(false);
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <p className='font-poppins text-primary text-sm font-normal break-words'>
              {message}
            </p>
          )}
        </div>
      </div>
      <div className='flex flex-shrink-0 items-start mt-0.5'>
        <CircleUser className='h-6 w-6 text-primary/80' />
      </div>
    </div>
  );
};
