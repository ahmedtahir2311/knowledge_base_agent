import Chat from "@/components/chat";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between p-4 md:p-24 bg-zinc-950 text-zinc-50">

      <Chat />

      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
        {/* Footer or extra links can go here */}
      </div>
    </main>
  );
}
