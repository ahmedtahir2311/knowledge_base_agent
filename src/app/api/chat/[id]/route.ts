import {
  deleteChat,
  getChatById,
  getChats,
  renameChatTitle,
} from "@/lib/utils/chat";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("clientId");
    const { id: chatId } = await params;
    if (!clientId || !chatId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }

    const chat = await getChatById(chatId, clientId);

    return NextResponse.json({ chat });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get chat" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const { clientId, newTitle } = await request.json();

    const chat = await renameChatTitle(id, clientId, userId, newTitle);

    return NextResponse.json({ success: true, chat });
  } catch (error) {
    console.error("Error renaming chat:", error);
    return NextResponse.json(
      { error: "Failed to rename chat", success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const { clientId, deleteAll } = await request.json();

    console.log({ id, clientId, deleteAll });

    const chat = await deleteChat(userId, deleteAll, clientId, id);

    return NextResponse.json({ success: true, chat });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Failed to delete chat", success: false },
      { status: 500 }
    );
  }
}
