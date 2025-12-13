import { Chat, CoreMessageWithReasoning } from "@/lib/types";
import { CoreMessage } from "ai";
import { redisClient } from "@/lib/config/redis";

export async function getChatById(chatId: string, clientId: string) {
  const chat = await redisClient.hGetAll(`client-${clientId}-chat:${chatId}`);
  if (Object.keys(chat).length === 0) {
    return null;
  }
  return chat;
}

export async function getChats(
  userId: string,
  clientId: string
): Promise<Chat[]> {
  try {
    const ids: string[] = await redisClient.zRange(
      `user:chat:${userId}`,
      0,
      -1,
      {
        REV: true,
      }
    );

    if (!ids || ids.length === 0) {
      return [];
    }

    const chats = await Promise.all(
      ids.map(async (id) => {
        if (id.includes(clientId)) {
          const chatDetails = await redisClient.hGetAll(id);
          if (Object.keys(chatDetails).length === 0) {
            return null;
          }
          return parseChatFromRedis(chatDetails);
        } else {
          return null;
        }
      })
    );

    const filteredChats = chats.filter((chat): chat is Chat => chat !== null);
    return filteredChats;
  } catch (error) {
    console.error("[Server] Error in getting chats:", error);
    return [];
  }
}

// Helper function to parse Redis hash values to proper Chat object
function parseChatFromRedis(data: Record<string, string>): Chat {
  return {
    ...data,
    id: data.id,
    userId: data.userId,
    clientId: data.clientId,
    title: data.title,
    path: data.path,
    isFavourite: data.isFavourite === "true",
    createdAt: new Date(parseInt(data.createdAt || "0")),
    updatedAt: new Date(parseInt(data.updatedAt || "0")),
    messages: data.messages ? JSON.parse(data.messages) : [],
  };
}

export async function saveChat(
  chatId: string,
  clientId: string,
  userId: string,
  title: string = "Untitled"
) {
  try {
    await redisClient.hSet(`client-${clientId}-chat:${chatId}`, {
      userId,
      title,
      clientId,
      id: chatId,
      isFavourite: "false",
      createdAt: Date.now().toString(),
      updatedAt: Date.now().toString(),
      path: `/client/${clientId}/chat/${chatId}`,
    });
    await redisClient.zAdd(`user:chat:${userId}`, {
      score: Date.now(),
      value: `client-${clientId}-chat:${chatId}`,
    });
  } catch (error) {
    console.error("Error in saving chat:", error);
  }
}

export async function renameChatTitle(
  chatId: string,
  clientId: string,
  userId: string,
  newTitle: string
): Promise<Chat | null> {
  try {
    const chatData = await redisClient.hGetAll(
      `client-${clientId}-chat:${chatId}`
    );

    if (Object.keys(chatData).length === 0 || chatData.userId !== userId) {
      return null;
    }

    const chat = parseChatFromRedis(chatData);

    await redisClient.hSet(`client-${clientId}-chat:${chatId}`, {
      title: newTitle,
    });

    await redisClient.zAdd(`user:chat:${userId}`, {
      score: Date.now(),
      value: `client-${clientId}-chat:${chatId}`,
    });

    return {
      ...chat,
      title: newTitle,
    };
  } catch (error) {
    console.error("Error in renameChatTitle function:", error);
    return null;
  }
}

export async function saveMessages(
  chatId: string,
  clientId: string,
  messages: CoreMessage[] | CoreMessageWithReasoning[]
) {
  try {
    const chatData = await redisClient.hGetAll(
      `client-${clientId}-chat:${chatId}`
    );
    if (Object.keys(chatData).length === 0) {
      throw new Error("Chat not found when saving messages");
    }

    // Ensure reasoning data is preserved when saving
    const messagesToSave = messages.map((msg) => {
      // If the message has a reasoning property, preserve it
      if ("reasoning" in msg) {
        return msg;
      }
      return msg;
    });

    const multi = redisClient.multi();
    multi.hSet(`client-${clientId}-chat:${chatId}`, {
      messages: JSON.stringify(messagesToSave),
      updatedAt: Date.now().toString(),
    });
    multi.zAdd(`user:chat:${chatData.userId}`, {
      score: Date.now(),
      value: `client-${clientId}-chat:${chatId}`,
    });
    await multi.exec();
  } catch (error) {
    console.error("Error in saving messages:", error);
    throw error;
  }
}

export async function createFavoriteChat(chatId: string, clientId: string) {
  const chatData = await redisClient.hGetAll(
    `client-${clientId}-chat:${chatId}`
  );
  if (Object.keys(chatData).length === 0) {
    return null;
  }

  const chat = parseChatFromRedis(chatData);
  const isFavourite = !chat.isFavourite;

  await redisClient.hSet(`client-${clientId}-chat:${chatId}`, {
    isFavourite: isFavourite.toString(),
  });

  return true;
}

export async function getFavoriteChats(userId: string, clientId: string) {
  const chats = await getChats(userId, clientId);
  const favoriteChats = chats.filter((chat) => chat.isFavourite);
  return favoriteChats;
}

export async function deleteChat(
  userId: string,
  deleteAll: boolean = false,
  clientId: string,
  chatId?: string
) {
  if (deleteAll) {
    //deleting all chats based on user client id
    const chats = await getChats(userId, clientId);

    if (chats.length > 0) {
      const multi = redisClient.multi();

      // Delete each chat hash
      for (const chat of chats) {
        multi.del(`client-${clientId}-chat:${chat.id}`);
      }

      // Remove all entries from the sorted set
      multi.del(`user:chat:${userId}`);

      await multi.exec();
    }
  } else {
    //deleting a single chat
    const chat = await redisClient.hGetAll(`client-${clientId}-chat:${chatId}`);
    if (Object.keys(chat).length === 0) {
      return null;
    }

    const multi = redisClient.multi();
    // Delete the chat hash
    multi.del(`client-${clientId}-chat:${chatId}`);
    // Remove from the sorted set
    multi.zRem(`user:chat:${userId}`, `client-${clientId}-chat:${chatId}`);
    await multi.exec();
  }
}
