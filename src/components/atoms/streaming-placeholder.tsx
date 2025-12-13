import { Loader } from "lucide-react";
import React from "react";

// Import StreamingPlaceholder component or redefine it here
const StreamingPlaceholder = ({ type }: { type: string }) => (
  <div className='flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900'>
    <div className='[&>img]:dark:brightness-100 [&>img]:brightness-0'>
      <Loader className='h-8 w-8 animate-spin text-gray-700' />
    </div>
    <div className='flex flex-col'>
      <div className='text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center'>
        {type}
        <span className='inline-flex ml-1'>
          <span className='animate-dot'>.</span>
          <span className='animate-dot'>.</span>
          <span className='animate-dot'>.</span>
        </span>
      </div>
      <div className='text-sm text-gray-500 dark:text-gray-400'>
        Will render when response is complete
      </div>
    </div>
  </div>
);
export default StreamingPlaceholder;
