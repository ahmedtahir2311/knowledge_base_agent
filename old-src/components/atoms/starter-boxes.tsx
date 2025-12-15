import React, { useState } from "react";

export type ApiPrompts = string[];

const prompts: ApiPrompts = [
  "What are the best practices for managing delays in a commercial construction project?",
  "How can contractors address the current shortage of skilled labor in the construction industry?",
  "What are some cost-effective ways to make a construction project more environmentally sustainable?",
  "How can BIM (Building Information Modeling) improve collaboration in large-scale infrastructure projects?",
  "What are the pros and cons of using precast concrete vs. traditional poured-in-place concrete?",
  "What building codes and safety regulations must be considered when constructing a high-rise site?",
];

// Define the props for PromptBoxes
interface PromptBoxesProps {
  handleClick: (e: React.MouseEvent, prompt: string) => void;
}

const PromptBoxes: React.FC<PromptBoxesProps> = ({ handleClick }) => {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className='h-full w-full flex justify-center items-center'>
      <div className='flex flex-col items-center'>
        <div className='prompt-boxes grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
          {prompts.map((api, index) => (
            <div
              key={index}
              onClick={(e) => handleClick(e, api)}
              className='group box bg-background p-4 rounded-lg hover:bg-[#ebf6fa] transition duration-300 ease-in-out cursor-pointer'
              style={{
                border: "0.5px solid #1b1b1b",
                boxShadow: "0px 0px 4px 0px #1b1b1b",
              }}
            >
              <p className='text-sm font-medium'>{api}</p>
            </div>
          ))}
        </div>
        {/* <div className='text-start pl-4 mt-4' onClick={openModal}>
          <p className='text-xs underline cursor-pointer'>View More</p>
        </div> */}
        {/* <PromptModal
          isOpen={showModal}
          onClose={closeModal}
          onClick={handleClick}
          orgId={orgId}
        /> */}
      </div>
    </div>
  );
};

export default PromptBoxes;
