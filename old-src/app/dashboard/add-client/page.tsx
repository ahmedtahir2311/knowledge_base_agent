"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import StepIndicator from "@/components/atoms/step-indicator";
import ClientDetailForm from "@/components/organisms/client-details";
import FileUploadForm from "@/components/organisms/file-upload";
import ContractTypeForm from "@/components/organisms/contract-type";
import NavigationButton from "@/components/atoms/navigation-button";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type FileVector = {
  file_id: string;
  file_name: string;
  file_link: string;
  file_path: string;
  type: string;
  size: number;
  summary: string;
  tags: string[];
};

type Client = {
  clientId: string;
  clientName: string;
  country: string;
  instructions: string;
  contractType: string;
  files: FileVector[];
};

const AddClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    clientName: "",
    country: "",
    instructions: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [alreadyUploadedFiles, setAlreadyUploadedFiles] = useState<
    FileVector[]
  >([]);
  const [filesToDelete, setFilesToDelete] = useState<FileVector[]>([]);
  const [contractType, setContractType] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const steps = [
    { id: 1, label: "Project Detail", completed: currentStep > 1 },
    { id: 2, label: "Select Contract Type", completed: currentStep > 2 },
    { id: 3, label: "Upload File", completed: currentStep > 3 },
  ];

  useEffect(() => {
    if (clientId) {
      setIsEditMode(true);
      fetchClientData(clientId);
    }
  }, [clientId]);

  const fetchClientData = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/clients?clientId=${id}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch client data");
      }

      const data = await response.json();
      const clientData = data.client as Client;

      if (!clientData) {
        toast.error("Client not found");
        router.push("/dashboard");
        return;
      }

      setFormData({
        clientName: clientData.clientName || "",
        country: clientData.country || "",
        instructions: clientData.instructions || "",
      });

      setAlreadyUploadedFiles(
        Array.isArray(clientData.files)
          ? clientData.files.map((file) => ({
              file_id: file.file_id || "",
              file_name: file.file_name || "",
              file_link: file.file_link || "",
              file_path: file.file_path || "",
              type: file.type || "",
              size: file.size || 0,
              summary: file.summary || "",
              tags: file.tags || [],
            }))
          : []
      );

      setContractType(clientData.contractType || "");
    } catch (error) {
      console.error("Error fetching client data:", error);
      toast.error("Failed to load client data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleFileChange = (files: File[]) => {
    setSelectedFiles([...files]);
  };

  const handleContractTypeSelect = (typeId: string) => {
    setContractType(typeId);
  };

  const handleFileToDelete = (filesToRemove: FileVector[]) => {
    setFilesToDelete(filesToRemove);
  };

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      await submitForm();
    }
  };

  const submitForm = async () => {
    try {
      setIsLoading(true);

      // Prepare form data
      const formDataToSend = new FormData();
      formDataToSend.append("clientName", formData.clientName);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("instructions", formData.instructions);
      formDataToSend.append("contractType", contractType);

      // Append each file to the FormData
      selectedFiles.forEach((file) => {
        formDataToSend.append("files", file);
      });

      let response;

      // Handle edit vs create mode
      if (clientId) {
        formDataToSend.append("clientId", clientId);
        formDataToSend.append("filesToDelete", JSON.stringify(filesToDelete));

        response = await fetch(`/api/clients/`, {
          method: "PATCH",
          body: formDataToSend,
        });
      } else {
        response = await fetch("/api/clients", {
          method: "POST",
          body: formDataToSend,
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to save client");
      }

      toast.success(
        `Client successfully ${isEditMode ? "updated" : "created"}`
      );
      router.push("/dashboard");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 1:
        return (
          !formData.clientName || !formData.country || !formData.instructions
        );
      case 2:
        return !contractType;
      case 3:
        return !selectedFiles.length && !alreadyUploadedFiles.length;
      default:
        return false;
    }
  };

  return (
    <div className='w-full bg-white'>
      <div className='w-full h-full mx-auto px-12 pt-12'>
        {/* <div className='mb-8'>
          <Link
            href='/dashboard'
            className='flex items-center gap-2 text-gray-600 hover:text-black w-fit'
          >
            <ArrowLeftIcon />
            Back
          </Link>
        </div> */}

        <div className='flex justify-between items-center gap-2'>
          <h1 className='text-2xl font-bold mb-2'>
            {isEditMode ? "Edit Project" : "Add new Project"}
          </h1>
        </div>
        <p className='text-gray-600 mb-8'>
          {isEditMode
            ? "Update project information below."
            : "Kindly add the following details to proceed with adding the project."}
        </p>

        <StepIndicator currentStep={currentStep} steps={steps} />

        <div className='mt-8 mb-16'>
          {currentStep === 1 && (
            <ClientDetailForm
              formData={formData}
              onChange={handleInputChange}
              isEdit={isEditMode}
            />
          )}
          {currentStep === 2 && (
            <ContractTypeForm
              selectedType={contractType}
              onTypeSelect={handleContractTypeSelect}
              isEdit={isEditMode}
            />
          )}
          {currentStep === 3 && (
            <FileUploadForm
              selectedFiles={selectedFiles}
              onFileChange={handleFileChange}
              alreadyUploadedFiles={alreadyUploadedFiles}
              setFilesToDelete={handleFileToDelete}
            />
          )}
        </div>

        <div className='flex justify-between'>
          {currentStep > 1 ? (
            <NavigationButton type='back' onClick={handleBack} />
          ) : (
            <div></div>
          )}
          <NavigationButton
            type={currentStep === 3 ? "submit" : "next"}
            onClick={handleNext}
            disabled={isNextDisabled() || isLoading}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default AddClient;
