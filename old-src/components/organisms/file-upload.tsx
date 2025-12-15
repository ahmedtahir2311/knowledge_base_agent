import React, { useState, useEffect, useRef } from "react";
import { FileIcon, TrashIcon, AlertCircleIcon } from "lucide-react";
import { getProperFileExtension } from "@/lib/utils";
import { toast } from "sonner";

interface FileVector {
  file_id: string;
  file_name: string;
  file_link: string;
  file_path: string;
  type: string;
  size: number;
  summary: string;
  tags: string[];
}

interface FileUploadFormProps {
  onFileChange: (files: File[]) => void;
  selectedFiles: File[];
  alreadyUploadedFiles: FileVector[];
  setFilesToDelete: (files: FileVector[]) => void;
}

const FileUploadForm = ({
  onFileChange,
  selectedFiles,
  alreadyUploadedFiles,
  setFilesToDelete,
}: FileUploadFormProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [displayedExistingFiles, setDisplayedExistingFiles] = useState<
    FileVector[]
  >([]);
  const [filesToRemove, setFilesToRemove] = useState<FileVector[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize displayed existing files when component loads or alreadyUploadedFiles changes
    setDisplayedExistingFiles([...alreadyUploadedFiles]);
  }, [alreadyUploadedFiles]);

  useEffect(() => {
    // Update parent component whenever files to delete change
    setFilesToDelete(filesToRemove);
  }, [filesToRemove, setFilesToDelete]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      handleAddFiles(droppedFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      handleAddFiles(newFiles);
    }
  };

  const handleAddFiles = (filesToAdd: File[]) => {
    if (filesToAdd.some((file) => file.size > 5 * 1024 * 1024)) {
      toast.error("File size exceeds 5 MB limit.");
    }
    // Only check for duplicates against currently displayed files
    // This allows re-uploading files that were previously deleted
    const currentlyDisplayedFileNames = [
      ...displayedExistingFiles.map((f) => f.file_name),
      ...selectedFiles.map((f) => f.name),
    ];

    const uniqueNewFiles = filesToAdd.filter(
      (file) =>
        !currentlyDisplayedFileNames.includes(file.name) &&
        file.size <= 5 * 1024 * 1024
    );
    onFileChange([...selectedFiles, ...uniqueNewFiles]);
  };

  const handleRemoveFile = (
    index: number,
    isAlreadyUploaded: boolean = false
  ) => {
    if (isAlreadyUploaded) {
      const fileToRemove = displayedExistingFiles[index];
      setFilesToRemove((prev) => [...prev, fileToRemove]);

      const updatedExistingFiles = [...displayedExistingFiles];
      updatedExistingFiles.splice(index, 1);
      setDisplayedExistingFiles(updatedExistingFiles);

      // Reset file input to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    onFileChange(updatedFiles);

    // Reset file input to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };

  return (
    <div className='w-full max-w-3xl mx-auto bg-[#F9F9F9] p-8 rounded-lg shadow-md'>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center bg-[#F5FCFD] ${
          isDragging ? "border-black bg-gray-50" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className='flex flex-col items-center justify-center space-y-4'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='48'
            height='48'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='text-gray-400'
          >
            <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'></path>
            <polyline points='17 8 12 3 7 8'></polyline>
            <line x1='12' y1='3' x2='12' y2='15'></line>
          </svg>
          <p className='text-lg font-medium'>
            Drag and drop your files here, or{" "}
            <label className='text-blue-600 cursor-pointer hover:underline'>
              browse
              <input
                type='file'
                className='hidden'
                onChange={handleFileSelect}
                accept='.pdf' //.doc,.docx,.jpeg,.jpg,.png,.ppt,.pptx,.txt,.csv
                multiple
                ref={fileInputRef}
              />
            </label>
          </p>
          <p className='text-sm text-gray-500'>
            Only PDF files up to 5 MB are supported
          </p>
        </div>
      </div>

      <div className='mt-6'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='font-medium'>
            Uploaded Files (
            {displayedExistingFiles.length + selectedFiles.length})
          </h3>
          {/* {filesToRemove.length > 0 && (
            <div className='flex items-center text-amber-600 text-sm'>
              <AlertCircleIcon className='w-4 h-4 mr-1' />
              <span>{filesToRemove.length} file(s) marked for deletion</span>
            </div>
          )} */}
        </div>

        <div className='rounded-lg max-h-[140px] overflow-y-auto'>
          {displayedExistingFiles.length === 0 &&
            selectedFiles.length === 0 && (
              <div className='text-center py-4 text-gray-500'>
                No files uploaded yet
              </div>
            )}

          <div className='space-y-3'>
            {/* Existing files */}
            {displayedExistingFiles.map((file, index) => (
              <div
                key={`existing-${file.file_name}-${index}`}
                className='flex items-center justify-between border border-[#11AF22] p-3 rounded-lg bg-white'
              >
                <div className='flex items-center space-x-3'>
                  <div className='p-2 bg-gray-100 rounded'>
                    <FileIcon className='w-5 h-5' />
                  </div>
                  <div>
                    <p className='font-medium'>{file.file_name}</p>
                    <p className='text-sm text-gray-500'>
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFile(index, true)}
                  className='bg-red-100 text-white hover:text-red-700 cursor-pointer p-2 rounded-lg'
                >
                  <TrashIcon className='w-4 h-4 text-red-500' />
                </button>
              </div>
            ))}

            {/* Newly added files */}
            {selectedFiles.map((file, index) => (
              <div
                key={`new-${file.name}-${index}`}
                className='flex items-center justify-between border border-blue-300 p-3 rounded-lg bg-white'
              >
                <div className='flex items-center space-x-3'>
                  <div className='p-2 bg-blue-50 rounded'>
                    <FileIcon className='w-5 h-5 text-blue-500' />
                  </div>
                  <div>
                    <div className='flex items-center'>
                      <p className='font-medium'>{file.name}</p>
                      <span className='ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full'>
                        New
                      </span>
                    </div>
                    <p className='text-sm text-gray-500'>
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className='bg-red-100 text-white hover:text-red-700 cursor-pointer p-2 rounded-lg'
                >
                  <TrashIcon className='w-4 h-4 text-red-500' />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadForm;
