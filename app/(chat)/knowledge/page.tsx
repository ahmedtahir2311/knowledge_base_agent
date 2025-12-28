"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Loader2, Plus, Trash, FileText } from "lucide-react";
import { format } from "date-fns";

type Document = {
  id: string;
  title: string;
  status: "processing" | "completed" | "failed";
  createdAt: string;
  metadata: any;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function KnowledgeBasePage() {
  const { data: documents, isLoading } = useSWR<Document[]>(
    "/api/documents",
    fetcher
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setIsUploading(true);

    try {
      const res = await fetch(
        `/api/documents/upload?filename=${encodeURIComponent(file.name)}&type=${
          file.type
        }`,
        {
          method: "POST",
          body: file,
        }
      );

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      // Optimistic update or just revalidate
      mutate("/api/documents");
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const res = await fetch(`/api/documents?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      mutate("/api/documents");
    } catch (error) {
      console.error(error);
      alert("Failed to delete document");
    }
  };

  return (
    <div className='flex flex-col h-full p-6 max-w-4xl mx-auto w-full'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-2xl font-bold mb-2'>Knowledge Base</h1>
          <p className='text-muted-foreground'>
            Upload documents to reference in your chats.
          </p>
        </div>
        <div>
          <label
            htmlFor='file-upload'
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isUploading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Plus className='mr-2 h-4 w-4' />
            )}
            Upload Document
          </label>
          <input
            id='file-upload'
            type='file'
            accept='.txt,.pdf,.md'
            className='hidden'
            onChange={handleUpload}
            disabled={isUploading}
          />
        </div>
      </div>

      <div className='border rounded-lg bg-card'>
        {isLoading ? (
          <div className='p-8 flex justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : documents && documents.length > 0 ? (
          <div className='divide-y'>
            {documents.map((doc) => (
              <div
                key={doc.id}
                className='flex items-center justify-between p-4'
              >
                <div className='flex items-center gap-4'>
                  <div className='p-2 bg-muted rounded-md'>
                    <FileText className='h-5 w-5 text-muted-foreground' />
                  </div>
                  <div>
                    <h3 className='font-medium'>{doc.title}</h3>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <span>
                        {format(new Date(doc.createdAt), "MMM d, yyyy")}
                      </span>
                      <span>•</span>
                      <span
                        className={`capitalize ${
                          doc.status === "completed"
                            ? "text-green-500"
                            : doc.status === "failed"
                            ? "text-red-500"
                            : "text-yellow-500"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className='p-2 text-muted-foreground hover:text-red-500 transition-colors'
                  title='Delete document'
                >
                  <Trash className='h-4 w-4' />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className='p-12 text-center text-muted-foreground'>
            No documents uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}
