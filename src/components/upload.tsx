"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileUpload() {
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            setStatus("error");
            setMessage("Please upload a PDF file.");
            return;
        }

        setIsUploading(true);
        setStatus("idle");
        setMessage("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Upload failed");
            }

            setStatus("success");
            setMessage(`Successfully processed ${data.chunks} chunks.`);
        } catch (error: any) {
            setStatus("error");
            setMessage(error.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="font-medium text-zinc-900">Knowledge Base</h3>
                    <p className="text-sm text-zinc-500">Upload PDF to chat with</p>
                </div>
            </div>

            <label
                className={cn(
                    "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                    isUploading
                        ? "bg-zinc-50 border-zinc-300"
                        : "hover:bg-zinc-50 border-zinc-300 hover:border-zinc-400",
                    status === "error" && "border-red-300 bg-red-50",
                    status === "success" && "border-green-300 bg-green-50"
                )}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                    ) : status === "success" ? (
                        <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                    ) : status === "error" ? (
                        <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                    ) : (
                        <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                    )}
                    <p className="text-sm text-zinc-500">
                        {isUploading
                            ? "Processing PDF..."
                            : status === "success"
                                ? "Upload Complete"
                                : status === "error"
                                    ? "Upload Failed"
                                    : "Click to upload PDF"}
                    </p>
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
            </label>

            {message && (
                <p
                    className={cn(
                        "mt-2 text-sm text-center",
                        status === "success" ? "text-green-600" : "text-red-600"
                    )}
                >
                    {message}
                </p>
            )}
        </div>
    );
}
