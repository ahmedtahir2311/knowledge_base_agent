import { Suspense } from "react";
import { Chat } from "@/components/organisms/chat/chat";
import { DataStreamHandler } from "@/context/data-stream-provider";
import { CHAT_MODEL } from "@/lib/ai/models";
import { generateUUID } from "@/lib/utils";
import { auth } from "@/app/(auth)/auth";

export default function Page() {
  return (
    <Suspense fallback={<div className='flex h-dvh' />}>
      <NewChatPage />
    </Suspense>
  );
}

async function NewChatPage() {
  const session = await auth();
  const id = generateUUID();

  return (
    <>
      <Chat
        autoResume={false}
        id={id}
        initialChatModel={CHAT_MODEL}
        initialMessages={[]}
        initialVisibilityType='private'
        isReadonly={false}
        key={id}
        user={session?.user}
      />
      <DataStreamHandler />
    </>
  );
}
