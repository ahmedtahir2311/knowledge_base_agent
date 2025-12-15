"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  LogOut,
  Trash2,
  ChevronRight,
  ChevronDown,
  Check,
  Star,
  Pencil,
  EllipsisVertical,
  LoaderCircle,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Logo from "@/components/atoms/Logo";
import { Chat } from "@/lib/types";
import DeleteModal from "@/components/atoms/delete-modal";
import { v4 as uuidv4 } from "uuid";
import { useChatContext } from "@/lib/context/chat-context";

export const ChatHistory = () => {
  const { id: clientId, chatId } = useParams();
  const { newChatData } = useChatContext();
  const router = useRouter();
  const { user } = useUser();
  const [showFavorite, setShowFavorite] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isChatsLoading, setIsChatsLoading] = useState(false);

  //favorite chats
  const [isFavoriteChatsLoading, setIsFavoriteChatsLoading] = useState(false);
  const [favoriteChats, setFavoriteChats] = useState<Chat[]>([]);

  //renaming chat
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [newChatTitle, setNewChatTitle] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [isRenaming, setIsRenaming] = useState(false);

  //deleting chat
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"delete" | "clear">("clear");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteChatId, setDeleteChatId] = useState<string | null>(null);

  const fetchChats = async () => {
    try {
      setIsChatsLoading(true);
      const chats = await fetch(`/api/chat?clientId=${clientId}`);
      const data = await chats.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setIsChatsLoading(false);
    }
  };

  const fetchFavoriteChats = async () => {
    try {
      setIsFavoriteChatsLoading(true);
      const favoriteChats = await fetch(`/api/chat/favorites?id=${clientId}`);
      const data = await favoriteChats.json();
      setFavoriteChats(data.chats || []);
    } catch (error) {
      console.error("Error fetching favorite chats:", error);
    } finally {
      setIsFavoriteChatsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && clientId) {
      fetchChats();
      fetchFavoriteChats();
    }
  }, [user?.id, clientId]);

  const filteredChats = searchQuery
    ? chats.filter((chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chats;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // If the dropdown is open and the click is outside the dropdown
      if (
        dropdownOpen !== null &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(null);
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Handle clicks outside of rename input to cancel renaming
  useEffect(() => {
    if (renamingChatId) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          renameInputRef.current &&
          !renameInputRef.current.contains(event.target as Node)
        ) {
          // Check if the click was on the Check button (which has a data attribute)
          const target = event.target as HTMLElement;
          if (!target.closest("[data-rename-submit]")) {
            setRenamingChatId(null);
          }
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [renamingChatId]);

  useEffect(() => {
    if (newChatData) {
      fetchChats();
    }
  }, [newChatData]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleDropdown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  const handleChatFavorite = async (id: string, index: number) => {
    try {
      const response = await fetch(`/api/chat/favorites`, {
        method: "POST",
        body: JSON.stringify({ id, clientId }),
      });

      const data = await response.json();

      if (data.success) {
        // Find the chat in the chats array
        const chat = chats.find((chat) => chat.id === id);

        if (chat) {
          // Check if the chat is already in favorites
          const isFavorite = chat.isFavourite || false;
          if (isFavorite) {
            // Remove from favorites
            setFavoriteChats(favoriteChats.filter((chat) => chat.id !== id));
            setChats(
              chats.map((chat) =>
                chat.id === id ? { ...chat, isFavourite: false } : chat
              )
            );
          } else {
            // Add to favorites
            setFavoriteChats([...favoriteChats, chat]);
            setChats(
              chats.map((chat) =>
                chat.id === id ? { ...chat, isFavourite: true } : chat
              )
            );
          }
        }
      }

      // Close dropdown after action completes
      setDropdownOpen(null);
    } catch (error) {
      console.error("Error favoriting chat:", error);
    }
  };

  const handleChatRename = (id: string) => {
    // Find the chat to get its current title
    const chatToRename = chats.find((chat) => chat.id === id);
    if (chatToRename) {
      setNewChatTitle(chatToRename.title);
      setRenamingChatId(id);
      // Close dropdown after setting up rename
      setDropdownOpen(null);

      // Focus the input field after it renders
      setTimeout(() => {
        if (renameInputRef.current) {
          renameInputRef.current.focus();
          renameInputRef.current.select();
        }
      }, 10);
    }
  };

  const submitChatRename = async (id: string) => {
    if (!newChatTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setIsRenaming(true);
      // API call to update chat title
      const response = await fetch(`/api/chat/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newTitle: newChatTitle.trim(), clientId }),
      });

      if (!response.ok) {
        toast.error("Failed to rename chat");
        return;
      }
      toast.success("Chat renamed successfully");

      // Update local state regardless of API success to maintain UI consistency
      // Update in main chats list
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === id ? { ...chat, title: newChatTitle.trim() } : chat
        )
      );

      // Update in favorite chats if present
      setFavoriteChats((prevFavorites) =>
        prevFavorites.map((chat) =>
          chat.id === id ? { ...chat, title: newChatTitle.trim() } : chat
        )
      );
    } catch (error) {
      console.error("Error renaming chat:", error);
      toast.error("Failed to rename chat");
    } finally {
      setIsRenaming(false);
      // Reset renaming state
      setRenamingChatId(null);
      setNewChatTitle("");
    }
  };

  const handleChatDelete = async () => {
    try {
      setIsDeleting(true);
      // TODO: Implement API call to delete chat
      const response = await fetch(`/api/chat/${deleteChatId || "1"}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deleteAll: deleteType === "clear", clientId }),
      });

      if (!response.ok) {
        toast.error("Failed to delete chat");
        return;
      }
      toast.success("Chat deleted successfully");

      if (deleteType === "clear") {
        setChats([]);
        setFavoriteChats([]);
        router.push(`/client/${clientId}/chat/new`);
      } else {
        setChats(chats.filter((chat) => chat.id !== deleteChatId));
        setFavoriteChats(
          favoriteChats.filter((chat) => chat.id !== deleteChatId)
        );
        deleteChatId === chatId && router.push(`/client/${clientId}/chat/new`);
      }

      //reRoute to New Chat
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    } finally {
      setIsDeleting(false);
    }
  };

  const onChatClick = async (path: string) => {
    router.push(path);
  };

  return (
    <div
      className='w-full flex flex-col p-3 gap-[30px] bg-background shadow-2xl rounded-[10px] text-primary transition-width duration-300'
      style={{
        border: "0.5px solid #1b1b1b",
        boxShadow: "0px 0px 4px 0px #1b1b1b",
      }}
    >
      <div className='flex justify-center h-[50px]'>
        <Logo isExpanded={true} className='h-[50px] w-[167px] object-contain' />
      </div>

      <div className='flex flex-col gap-[16px] h-full'>
        {/* New chat button */}
        <div
          className='p-[10px] rounded-[38px] text-white text-center cursor-pointer bg-primary'
          onClick={() => {
            router.push(`/client/${clientId}/chat/new`);
          }}
        >
          <span className='font-poppins text-[12px] font-medium'>New chat</span>
        </div>

        {/* Favorite chats section */}
        <div
          className='flex justify-start items-center gap-[5px] cursor-pointer w-[max-content]'
          onClick={() => setShowFavorite(!showFavorite)}
        >
          <div className='font-poppins text-sm font-medium text-primary'>
            Favorite Chats
          </div>
          <ChevronDown
            className={`text-primary  h-[16px] w-[16px] transform transition-transform duration-300 ${
              showFavorite ? "rotate-0" : "-rotate-90"
            }`}
          />
        </div>

        {/* Favorite chats list */}
        {showFavorite && (
          <div className='overflow-y-scroll no-scrollbar h-[100px] animate-fadeInSlideDown transition-all duration-300'>
            {isFavoriteChatsLoading ? (
              <div className='flex justify-center items-center h-full'>
                <LoaderCircle className='h-[20px] w-[20px] animate-spin' />
              </div>
            ) : favoriteChats.length > 0 ? (
              <div>
                {favoriteChats.map((chat, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer relative p-[10px] rounded-[5px] group hover:bg-[#ebf6fa]`}
                    onClick={() => onChatClick(chat.path)}
                  >
                    <div className='flex justify-between items-center gap-[10px]'>
                      <div className='flex justify-between items-center font-poppins text-[12px] font-normal w-[100%]'>
                        <div className='w-[80%] overflow-hidden text-ellipsis whitespace-nowrap'>
                          {chat.title}
                        </div>
                        <div className='hidden group-hover:block'>
                          <div className='flex items-center space-x-2'>
                            <Star
                              className='h-[12px] w-[12px] fill-orange-500 text-orange-500'
                              onClick={() => handleChatFavorite(chat.id, index)}
                            />
                            <Pencil className='h-[12px] w-[12px] text-primary' />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='font-poppins text-sm text-center mt-10'>
                No Favorite Chats
              </div>
            )}
          </div>
        )}

        {/* Chat history section */}
        <div className='flex justify-between items-center'>
          <div className='font-poppins text-sm font-medium text-primary'>
            Chat History
          </div>
          <Search
            className='h-[16px] w-[16px] text-primary cursor-pointer'
            onClick={() => setShowSearchBar(!showSearchBar)}
          />
        </div>

        {/* Search bar */}
        {showSearchBar && (
          <div
            className='w-full flex justify-start items-center px-[10px] py-[10px] gap-[10px] rounded-[5px] animate-fadeInSlideDown'
            style={{
              border: "0.5px solid #1b1b1b",
              boxShadow: "0px 0px 4px 0px #1b1b1b",
            }}
          >
            <Search
              className='h-[16px] w-[16px]'
              style={{ color: "#1b1b1b" }}
            />
            <input
              type='text'
              placeholder='Search'
              className='w-full focus:outline-none border-none bg-transparent text-[12px] text-primary'
              onChange={handleSearch}
            />
          </div>
        )}

        {/* Chat list */}
        <div
          className='overflow-y-scroll no-scrollbar'
          style={{
            height:
              showFavorite && !showSearchBar
                ? "calc(100vh - 476px)"
                : !showFavorite && showSearchBar
                ? "calc(100vh - 415px)"
                : showFavorite && showSearchBar
                ? "calc(100vh - 531px)"
                : "calc(100vh - 360px)",
          }}
        >
          {isChatsLoading ? (
            <div className='flex justify-center items-center h-full'>
              <LoaderCircle className='h-[20px] w-[20px] animate-spin' />
            </div>
          ) : filteredChats?.length > 0 ? (
            <div>
              {filteredChats?.map((chat, index) => (
                <div
                  key={index}
                  className={`cursor-pointer relative p-[10px] rounded-[5px] group hover:bg-[#ebf6fa] ${
                    chatId === chat.id ? "bg-[#ebf6fa]" : ""
                  }`}
                  onClick={(e) => {
                    // Only navigate if not renaming and not clicking on dropdown
                    if (renamingChatId !== chat.id && dropdownOpen !== index) {
                      // Add navigation logic here if needed
                      onChatClick(chat.path);
                    }
                  }}
                >
                  <div className='flex justify-between items-center gap-[10px]'>
                    {renamingChatId === chat.id ? (
                      <div className='flex items-center justify-between w-full gap-2'>
                        <input
                          ref={renameInputRef}
                          type='text'
                          value={newChatTitle}
                          onChange={(e) => setNewChatTitle(e.target.value)}
                          disabled={isRenaming}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              submitChatRename(chat.id);
                            } else if (e.key === "Escape") {
                              setRenamingChatId(null);
                            }
                          }}
                          className='font-poppins text-[12px] font-normal w-[90%] bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-primary'
                          autoFocus
                        />
                        {isRenaming ? (
                          <Loader2 className='h-[16px] w-[16px] animate-spin' />
                        ) : (
                          <>
                            <div
                              className='cursor-pointer'
                              data-rename-submit
                              onClick={(e) => {
                                e.stopPropagation();
                                setRenamingChatId(null);
                              }}
                            >
                              <X className='h-[16px] w-[16px] text-red-500' />
                            </div>
                            <div
                              className='cursor-pointer'
                              data-rename-submit
                              onClick={(e) => {
                                e.stopPropagation();
                                submitChatRename(chat.id);
                              }}
                            >
                              <Check className='h-[16px] w-[16px] text-green-500' />
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className='font-poppins text-[12px] font-normal w-[90%] overflow-hidden text-ellipsis whitespace-nowrap'>
                          {chat.title}
                        </div>
                        <div
                          onClick={(e) => toggleDropdown(index, e)}
                          className='cursor-pointer h-[16px] w-[16px] hidden group-hover:block'
                        >
                          <EllipsisVertical className='h-[16px] w-[20px] text-primary' />
                        </div>
                      </>
                    )}
                  </div>

                  {dropdownOpen === index && (
                    <div
                      ref={dropdownRef}
                      className='absolute top-[30px] right-0 p-[5px] w-[140px] rounded-md bg-secondary z-10 shadow-lg border border-gray-300'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        className='px-4 py-2 text-xs cursor-pointer flex justify-start items-center gap-[10px] hover:bg-white rounded-md'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChatRename(chat.id);
                        }}
                      >
                        <Pencil className='h-[16px] w-[16px] text-primary' />
                        <span className='font-poppins text-[12px] text-primary font-normal'>
                          Rename
                        </span>
                      </div>
                      <div
                        className='px-4 py-2 text-xs cursor-pointer flex justify-start items-center gap-[10px] hover:bg-white rounded-md'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChatFavorite(chat.id, index);
                        }}
                      >
                        <Star
                          className={`h-[16px] w-[16px] ${
                            chat.isFavourite
                              ? "fill-orange-500 text-orange-500"
                              : "text-primary"
                          }`}
                        />
                        <p className='font-poppins text-[12px] text-primary font-normal'>
                          {chat.isFavourite ? "Unfavorite" : "Favorite"}
                        </p>
                      </div>
                      <div
                        className='px-4 py-2 text-xs cursor-pointer flex justify-start items-center gap-[10px] hover:bg-white rounded-md'
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteChatId(chat.id);
                          setIsDeleteOpen(true);
                          setDeleteType("delete");
                          setDropdownOpen(null);
                        }}
                      >
                        <Trash2 className='h-[16px] w-[16px] text-primary' />
                        <span className='font-poppins text-[12px] text-primary font-normal'>
                          Delete
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className='font-poppins text-sm text-center mt-10'>
              No conversations found
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className='mt-auto flex flex-col gap-[0px]'>
          <div
            className='flex justify-center items-center gap-[5px] p-[10px] rounded-[5px] cursor-pointer hover:bg-[#ff000028]'
            onClick={() => {
              setIsDeleteOpen(true);
              setDeleteType("clear");
              setDropdownOpen(null);
            }}
          >
            <Trash2 className='h-[16px] w-[16px] text-red-500' />
            <span className='font-poppins text-[12px] font-normal text-[#FF0000]'>
              Clear All Chats
            </span>
          </div>
          {isDeleteOpen && (
            <DeleteModal
              isOpen={isDeleteOpen}
              onClose={() => setIsDeleteOpen(false)}
              onDelete={handleChatDelete}
              isDeleting={isDeleting}
              type={deleteType}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
