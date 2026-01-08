import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  type SQL,
} from "drizzle-orm";
import type { VisibilityType } from "@/components/molecules/visibility-selector";
import { ChatSDKError } from "../errors";
import { generateUUID } from "../utils";
import {
  type Chat,
  chat,
  type DBMessage,
  knowledgeDocument,
  lead,
  leadProfile,
  message,
  stream,
  type User,
  user,
  vote,
} from "./schema";

// ... existing code ...

export async function deleteKnowledgeDocumentById({ id }: { id: string }) {
  try {
    const [deletedDoc] = await db
      .delete(knowledgeDocument)
      .where(eq(knowledgeDocument.id, id))
      .returning();

    return deletedDoc;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete knowledge document by id"
    );
  }
}
import { generateHashedPassword } from "./utils";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
import { db } from "./drizzle";
// const client = postgres(process.env.POSTGRES_URL!);
// const db = drizzle(client);

export async function getUser(email: string): Promise<User[]> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get user by email"
    );
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({ email, password: hashedPassword });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to create user");
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await db.insert(user).values({ email, password }).returning({
      id: user.id,
      email: user.email,
    });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create guest user"
    );
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
    });
  } catch (error) {
    console.error("Failed to save chat in DB:", error);
    throw new ChatSDKError("bad_request:database", "Failed to save chat");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  try {
    const userChats = await db
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.userId, userId));

    if (userChats.length === 0) {
      return { deletedCount: 0 };
    }

    const chatIds = userChats.map((c) => c.id);

    await db.delete(vote).where(inArray(vote.chatId, chatIds));
    await db.delete(message).where(inArray(message.chatId, chatIds));
    await db.delete(stream).where(inArray(stream.chatId, chatIds));

    const deletedChats = await db
      .delete(chat)
      .where(eq(chat.userId, userId))
      .returning();

    return { deletedCount: deletedChats.length };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id)
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Chat[] = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${startingAfter} not found`
        );
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${endingBefore} not found`
        );
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get chats by user id"
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    if (!selectedChat) {
      return null;
    }

    return selectedChat;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to get chat by id");
  }
}

export async function saveMessages({ messages }: { messages: DBMessage[] }) {
  try {
    return await db.insert(message).values(messages);
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save messages");
  }
}

export async function updateMessage({
  id,
  parts,
}: {
  id: string;
  parts: DBMessage["parts"];
}) {
  try {
    return await db.update(message).set({ parts }).where(eq(message.id, id));
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to update message");
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get messages by chat id"
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === "up" })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === "up",
    });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to vote message");
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get votes by chat id"
    );
  }
}













export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message by id"
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp))
      );

    const messageIds = messagesToDelete.map(
      (currentMessage) => currentMessage.id
    );

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds))
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds))
        );
    }
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp"
    );
  }
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update chat visibility by id"
    );
  }
}

export async function updateChatTitleById({
  chatId,
  title,
}: {
  chatId: string;
  title: string;
}) {
  try {
    return await db.update(chat).set({ title }).where(eq(chat.id, chatId));
  } catch (error) {
    console.warn("Failed to update title for chat", chatId, error);
    return;
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, "user")
        )
      )
      .execute();

    return stats?.count ?? 0;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message count by user id"
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create stream id"
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get stream ids by chat id"
    );
  }
}

// Lead Management Queries

export async function createLead({
  chatId,
  userId,
  name,
  email,
  phone,
}: {
  chatId: string;
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
}) {
  try {
    const isComplete = !!(name && email && phone);
    const [newLead] = await db
      .insert(lead)
      .values({
        chatId,
        userId,
        name,
        email,
        phone,
        isComplete,
      })
      .returning();

    return newLead;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to create lead");
  }
}

export async function updateLead({
  id,
  name,
  email,
  phone,
}: {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
}) {
  try {
    // Get existing lead to merge data
    const [existingLead] = await db
      .select()
      .from(lead)
      .where(eq(lead.id, id));

    if (!existingLead) {
      throw new ChatSDKError("not_found:database", "Lead not found");
    }

    const updatedName = name ?? existingLead.name;
    const updatedEmail = email ?? existingLead.email;
    const updatedPhone = phone ?? existingLead.phone;
    const isComplete = !!(updatedName && updatedEmail && updatedPhone);

    const [updatedLead] = await db
      .update(lead)
      .set({
        name: updatedName,
        email: updatedEmail,
        phone: updatedPhone,
        isComplete,
        updatedAt: new Date(),
      })
      .where(eq(lead.id, id))
      .returning();

    return updatedLead;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to update lead");
  }
}

export async function getLeadByChatId({ chatId }: { chatId: string }) {
  try {
    const [existingLead] = await db
      .select()
      .from(lead)
      .where(eq(lead.chatId, chatId));

    return existingLead || null;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get lead by chat id"
    );
  }
}

export async function getLeadByUserId({ userId }: { userId: string }) {
  try {
    const [existingLead] = await db
      .select()
      .from(lead)
      .where(eq(lead.userId, userId))
      .orderBy(desc(lead.createdAt))
      .limit(1);

    return existingLead || null;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get lead by user id"
    );
  }
}

export async function createLeadProfile({
  leadId,
  preferences,
}: {
  leadId: string;
  preferences: {
    expectedROI?: string;
    riskTolerance?: string;
    propertyType?: string;
    preferredLocation?: string;
    holdingStrategy?: string;
    dealSize?: string;
    additionalPreferences?: string;
  };
}) {
  try {
    const metadata = preferences.additionalPreferences
      ? { additionalPreferences: preferences.additionalPreferences }
      : null;

    const [newProfile] = await db
      .insert(leadProfile)
      .values({
        leadId,
        expectedROI: preferences.expectedROI,
        riskTolerance: preferences.riskTolerance,
        propertyType: preferences.propertyType,
        preferredLocation: preferences.preferredLocation,
        holdingStrategy: preferences.holdingStrategy,
        dealSize: preferences.dealSize,
        metadata,
      })
      .returning();

    return newProfile;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create lead profile"
    );
  }
}

export async function updateLeadProfile({
  leadId,
  preferences,
}: {
  leadId: string;
  preferences: {
    expectedROI?: string;
    riskTolerance?: string;
    propertyType?: string;
    preferredLocation?: string;
    holdingStrategy?: string;
    dealSize?: string;
    additionalPreferences?: string;
  };
}) {
  try {
    // Get existing profile to merge data
    const [existingProfile] = await db
      .select()
      .from(leadProfile)
      .where(eq(leadProfile.leadId, leadId));

    if (!existingProfile) {
      // Create new profile if doesn't exist
      return await createLeadProfile({ leadId, preferences });
    }

    const existingMetadata = (existingProfile.metadata as Record<
      string,
      string
    >) || {};
    const newMetadata = preferences.additionalPreferences
      ? {
          ...existingMetadata,
          additionalPreferences: preferences.additionalPreferences,
        }
      : existingMetadata;

    const [updatedProfile] = await db
      .update(leadProfile)
      .set({
        expectedROI: preferences.expectedROI ?? existingProfile.expectedROI,
        riskTolerance:
          preferences.riskTolerance ?? existingProfile.riskTolerance,
        propertyType: preferences.propertyType ?? existingProfile.propertyType,
        preferredLocation:
          preferences.preferredLocation ?? existingProfile.preferredLocation,
        holdingStrategy:
          preferences.holdingStrategy ?? existingProfile.holdingStrategy,
        dealSize: preferences.dealSize ?? existingProfile.dealSize,
        metadata: newMetadata,
        updatedAt: new Date(),
      })
      .where(eq(leadProfile.leadId, leadId))
      .returning();

    return updatedProfile;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update lead profile"
    );
  }
}

export async function getLeadProfileByLeadId({ leadId }: { leadId: string }) {
  try {
    const [profile] = await db
      .select()
      .from(leadProfile)
      .where(eq(leadProfile.leadId, leadId));

    return profile || null;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get lead profile by lead id"
    );
  }
}
