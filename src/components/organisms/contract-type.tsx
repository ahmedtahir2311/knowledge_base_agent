import React from "react";

interface ContractType {
  id: string;
  name: string;
  description: string;
}

interface ContractTypeFormProps {
  selectedType: string;
  onTypeSelect: (typeId: string) => void;
  isEdit: boolean;
}

const ContractTypeForm = ({
  selectedType,
  onTypeSelect,
  isEdit,
}: ContractTypeFormProps) => {
  const contractTypes: ContractType[] = [
    {
      id: "FIDIC",
      name: "FIDIC",
      description: "Fédération Internationale des Ingénieurs-Conseils",
    },
    {
      id: "IChemE",
      name: "IChemE",
      description: "Institution of Chemical Engineers",
    },
    {
      id: "JCT",
      name: "JCT",
      description: "Joint Contracts Tribunal",
    },
    {
      id: "NEC",
      name: "NEC",
      description: "New Engineering Contracts",
    },
  ];

  return (
    <div className='w-full max-w-3xl mx-auto bg-[#F9F9F9] p-8 rounded-lg shadow-md'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {contractTypes.map((type) => (
          <div
            key={type.id}
            className={` bg-white border rounded-lg p-4 transition-all ${
              isEdit && selectedType !== type.name
                ? "opacity-50"
                : "cursor-pointer"
            } ${
              selectedType === type.id
                ? "border-black bg-gray-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => !isEdit && onTypeSelect(type.id)}
          >
            <div className='flex items-center justify-between'>
              <h3 className='font-medium'>{type.name}</h3>
              <div
                className={`w-5 h-5 rounded-full border ${
                  selectedType === type.id
                    ? "border-black bg-black"
                    : "border-gray-300"
                }`}
              >
                {selectedType === type.id && (
                  <div className='w-full h-full flex items-center justify-center'>
                    <div className='w-2 h-2 rounded-full bg-white'></div>
                  </div>
                )}
              </div>
            </div>
            <p className='text-sm text-gray-500'>{type.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContractTypeForm;
