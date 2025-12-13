import React from "react";
import { ChevronDownIcon, InfoIcon } from "lucide-react";
import { countries } from "@/lib/constants/countries";
import Tooltip from "@/components/atoms/tool-tip";

interface ClientDetailFormProps {
  formData: {
    clientName: string;
    country: string;
    instructions: string;
  };
  onChange: (field: string, value: string) => void;
  isEdit: boolean;
}

const ClientDetailForm = ({
  formData,
  onChange,
  isEdit,
}: ClientDetailFormProps) => {
  return (
    <div className='w-full max-w-3xl mx-auto bg-[#F9F9F9] p-8 rounded-lg shadow-md'>
      <div className='mb-6'>
        <label htmlFor='clientName' className='block mb-2 font-medium'>
          Project Name
        </label>
        <input
          id='clientName'
          type='text'
          placeholder='Enter Project Name'
          value={formData.clientName}
          onChange={(e) => onChange("clientName", e.target.value)}
          disabled={isEdit}
          className='w-full py-3 px-4 border border-gray-300 rounded-xl bg-background focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:opacity-50'
          style={{
            borderRadius: "30px",
          }}
        />
      </div>

      <div className='mb-6'>
        <label htmlFor='country' className='block mb-2 font-medium'>
          Country
        </label>
        <div className='relative'>
          <select
            id='country'
            value={formData.country}
            onChange={(e) => onChange("country", e.target.value)}
            className='w-full py-3 px-4 bg-background border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:opacity-50'
            disabled={isEdit}
            style={{
              borderRadius: "30px",
            }}
          >
            <option value=''>Select Country</option>
            {countries.map((country) => (
              <option
                key={country.name + "+" + country.code}
                value={country.name}
              >
                {country.flag} {country.name}
              </option>
            ))}
          </select>
          <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
            <ChevronDownIcon />
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor='instructions'
          className='flex items-center gap-2 mb-2 font-medium'
        >
          Instructions
          <Tooltip
            text='Provide detailed information about the project requirements, deadlines, specific client preferences, communication protocols, and any other relevant details that would help in delivering the project successfully.'
            position='top'
          >
            <span className='inline-flex items-center ml-1 text-gray-500'>
              <InfoIcon size={16} />
            </span>
          </Tooltip>
        </label>
        <textarea
          id='instructions'
          placeholder='Write instructions here...'
          value={formData.instructions}
          onChange={(e) => onChange("instructions", e.target.value)}
          className='w-full py-3 px-4 bg-background border border-gray-300 rounded-lg h-32 resize-none focus:outline-none focus:ring-1 focus:ring-gray-300'
          style={{
            borderRadius: "30px",
          }}
        />
      </div>
    </div>
  );
};

export default ClientDetailForm;
