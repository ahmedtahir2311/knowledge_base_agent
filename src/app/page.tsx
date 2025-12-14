import { Chat } from "@/components/chat";
import { FileUpload } from "@/components/upload";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
            Ultimate RAG Agent
          </h1>
          <p className="text-zinc-500">
            Upload documents and ask questions instantly
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[350px_1fr]">
          <div className="space-y-6">
            <FileUpload />

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
              <h4 className="font-medium mb-1">How it works</h4>
              <ul className="list-disc list-inside space-y-1 opacity-80">
                <li>Upload a PDF document</li>
                <li>Text is extracted & chunked</li>
                <li>Vectors stored in Qdrant</li>
                <li>AI searches & answers</li>
              </ul>
            </div>
          </div>

          <Chat />
        </div>
      </div>
    </main>
  );
}
