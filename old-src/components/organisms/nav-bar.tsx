"use client";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import LangToogle from "../atoms/lang-toogle";
import { useChatContext } from "@/lib/context/chat-context";

type Client = {
  clientId: string;
  clientName: string;
  country: string;
  instructions: string;
  contractType: string;
};

export const NavBar = () => {
  const { id: clientId } = useParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { language, setLanguage } = useChatContext();
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/clients", {
        method: "GET",
      });
      const data = await response.json();
      const clientsData = (data.clients as Client[]) || [];
      setClients(clientsData);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeClient = clients.find((client) => client.clientId === clientId);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setOpenDropdown(false);
    }
  };

  //if clicked out the dropdown close it
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setOpenDropdown(!openDropdown);
  };

  return (
    <div className='flex justify-between items-center py-2 px-4'>
      {/* Left side - Back button and client dropdown */}
      <div className='flex items-center gap-4'>
        {/* <button
          className='flex items-center gap-2 cursor-pointer'
          onClick={() => {
            router.back();
          }}
        >
          <ArrowLeftIcon className='w-4 h-4' />
          <span className='text-sm text-primary'>Back</span>
        </button> */}
        <div
          ref={dropdownRef}
          className='px-2 py-1 rounded-md flex items-center gap-4 cursor-pointer relative'
          style={{
            border: "0.5px solid #1b1b1b",
            boxShadow: "0px 0px 4px 0px #1b1b1b",
          }}
          onClick={toggleDropdown}
        >
          {loading ? (
            <Loader2 className='w-4 h-4 animate-spin text-md text-primary font-medium' />
          ) : (
            <span className='text-md font-medium text-primary'>
              {activeClient?.clientName}
            </span>
          )}
          {openDropdown ? (
            <ChevronUpIcon className='w-4 h-4' />
          ) : (
            <ChevronDownIcon className='w-4 h-4' />
          )}
          {openDropdown && (
            <div className='absolute top-10 left-0 w-[200px] border border-gray-300 max-h-[200px] bg-secondary shadow-lg rounded-md p-2 flex flex-col gap-2 z-10'>
              {clients.map((client) => (
                <div
                  key={client.clientId}
                  className='text-md px-2 py-1 rounded-md flex items-center gap-2 cursor-pointer hover:bg-gray-100'
                  onClick={() => {
                    toggleDropdown();
                    router.push(`/client/${client.clientId}/chat`);
                  }}
                >
                  <div className='text-sm text-primary'>
                    {client.clientName} - {client.country}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side - Dashboard button and user profile */}
      <div className='flex items-center gap-2'>
        <button
          className='flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors'
          onClick={() => router.push("/dashboard")}
        >
          <LayoutDashboard className='w-5 h-5' />
          <span className='text-sm font-medium'>Dashboard</span>
        </button>

        <LangToogle
          languageContext={language}
          onChange={(language) => {
            setLanguage(language);
          }}
        />

        <div className='mt-1'>
          <UserButton
            afterSignOutUrl='/sign-in'
            appearance={{
              elements: {
                userButtonAvatarBox: "w-10 h-10",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};
