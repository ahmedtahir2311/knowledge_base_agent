"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { SearchIcon, MoreVertical, PencilIcon, TrashIcon } from "lucide-react";
import useDebounce from "../../lib/hooks/useDebounce";

type FileVector = {
  vectorIds: string[];
  name: string;
  type: string;
  size: number;
};

type Client = {
  clientId: string;
  clientName: string;
  country: string;
  instructions: string;
  contractType: string;
  files: FileVector[];
};

const index = () => {
  const router = useRouter();
  const { user } = useUser();

  const [clients, setClients] = useState<Client[]>([]);
  const [originalClients, setOriginalClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  useEffect(() => {
    if (user) {
      const fetchClients = async () => {
        setLoading(true);
        try {
          const response = await fetch("/api/clients", {
            method: "GET",
          });
          const data = await response.json();
          const clientsData = (data.clients as Client[]) || [];
          setClients(clientsData);
          setOriginalClients(clientsData);
        } catch (error) {
          console.error("Error fetching clients:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchClients();
    }
  }, [user]);

  // Effect for handling search with debounce
  useEffect(() => {
    if (debouncedSearchTerm.length > 0) {
      const filteredClients = originalClients.filter(
        (client) =>
          //if any thing Matches from name and country
          client.clientName
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          client.country
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase())
      );
      setClients(filteredClients);
    } else {
      setClients(originalClients);
    }
  }, [debouncedSearchTerm, originalClients]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDropdownToggle = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === clientId ? null : clientId);
  };

  const handleEditClient = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/add-client?clientId=${clientId}`);
    setOpenDropdownId(null);
  };

  const handleDeleteClient = async (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Add delete functionality here
    try {
      const response = await fetch(`/api/clients`, {
        method: "DELETE",
        body: JSON.stringify({ clientId }),
      });
      const data = await response.json();
      if (data.success) {
        setClients(clients.filter((client) => client.clientId !== clientId));
      }
    } catch (error) {
      console.error("Error deleting client:", error);
    }
    setOpenDropdownId(null);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setOpenDropdownId(null);
    }
  };

  //if clicked out the dropdown close it
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className='p-8 mt-12'>
      <div className='flex items-center justify-between mb-12'>
        <div className='relative w-[530px]'>
          <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
            <SearchIcon className='w-4 h-4 text-gray-500' />
          </div>
          <input
            type='text'
            placeholder='Search here'
            className='w-full p-3 pl-10 text-sm rounded-xl border border-gray-200'
            onChange={handleSearch}
            value={searchTerm}
            style={{
              borderRadius: "30px",
            }}
          />
        </div>
        <button
          className='flex items-center justify-center gap-2 py-2  bg-[#1A2231] text-white font-sm rounded-xl px-16 cursor-pointer'
          style={{
            borderRadius: "30px",
          }}
          onClick={() => {
            router.push("/dashboard/add-client");
          }}
        >
          <span className='text-xl'>+</span> Add New Client
        </button>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1A2231]'></div>
        </div>
      ) : clients.length === 0 ? (
        <div className='flex flex-col justify-center items-center h-64'>
          <div className='text-xl font-medium text-gray-500 mb-4'>
            No clients found
          </div>
          <p className='text-gray-400 mb-6'>
            Get started by adding your first client
          </p>
          <button
            className='flex items-center justify-center gap-2 py-2 bg-[#1A2231] text-white font-sm rounded-xl px-8 cursor-pointer'
            style={{ borderRadius: "30px" }}
            onClick={() => router.push("/dashboard/add-client")}
          >
            <span className='text-xl'>+</span> Add New Client
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
          {clients.map((client: any) => (
            <div
              key={client.id}
              className='bg-white p-8 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer relative flex justify-center items-center'
              onClick={() => {
                router.push(`/client/${client.clientId}/chat`);
              }}
            >
              <div ref={dropdownRef} className='absolute top-2 right-2'>
                <button
                  onClick={(e) => handleDropdownToggle(client.clientId, e)}
                  className='p-1 hover:bg-gray-100 rounded-full'
                >
                  <MoreVertical size={16} />
                </button>

                {openDropdownId === client.clientId && (
                  <div className='absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10 border border-gray-200'>
                    <div className='py-1'>
                      <button
                        className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2'
                        onClick={(e) => handleEditClient(client.clientId, e)}
                      >
                        <PencilIcon size={16} /> Edit
                      </button>
                      <button
                        className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2'
                        onClick={(e) => handleDeleteClient(client.clientId, e)}
                      >
                        <TrashIcon size={16} className='text-red-500' /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <h3 className='text-lg font-medium text-center'>{`${client.clientName} - ${client.country}`}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default index;
