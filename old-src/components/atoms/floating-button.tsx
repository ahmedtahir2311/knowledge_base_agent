"use client";

// On bottom right corner of the screen, a floating add button

import { PlusIcon } from "lucide-react";

const FloatingAdd = ({ onClick }: { onClick: () => void }) => {
  return (
    <div className='fixed bottom-8 right-8 z-50 pointer-events-none'>
      <button
        className='bg-blue-500 cursor-pointer pointer-events-auto text-white px-4 py-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-300'
        onClick={onClick}
      >
        <PlusIcon className='w-6 h-6 ' />
      </button>
    </div>
  );
};

export default FloatingAdd;
