import { NextRequest, NextResponse } from "next/server";
import { createFavoriteChat, getFavoriteChats } from "@/lib/utils/chat";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { id: chatId, clientId } = await request.json();

    if (!chatId || !clientId) {
      return NextResponse.json(
        { error: "Chat ID and Client ID is required" },
        { status: 400 }
      );
    }

    const favoriteChat = await createFavoriteChat(chatId, clientId);

    return NextResponse.json({ success: true, chat: favoriteChat });
  } catch (error) {
    console.error("Error creating favorite chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("id");

    const { userId } = await auth();

    if (!userId || !clientId) {
      return NextResponse.json(
        { error: "UserId and Client Id is Required" },
        { status: 401 }
      );
    }
    const favoriteChats = await getFavoriteChats(userId, clientId);

    return NextResponse.json({ success: true, chats: favoriteChats || [] });
  } catch (error) {
    console.error("Error getting favorite chats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
