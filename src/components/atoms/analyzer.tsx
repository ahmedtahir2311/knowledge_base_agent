import { BrainCog } from "lucide-react";

type analyzerType = {
  type: string;
  headTitle?: string;
  details?: {
    assistantType: string;
    text: string;
    progress?: string;
    plan?: string;
  };
};

const Analyzer = ({ type, headTitle, details }: analyzerType) => {
  const cleanTitle = headTitle?.replace(/\.+$/, "");

  return (
    <div className='flex items-center gap-3 mb-4 p-2 rounded-lg bg-secondary'>
      <BrainCog className='h-[24px] w-[24px] animate-spin' />
      <div className='flex flex-col'>
        <div className='text-sm font-medium text-primary flex items-center'>
          {cleanTitle}
          <span className='inline-flex ml-1'>
            <span className='animate-dot'>.</span>
            <span className='animate-dot'>.</span>
            <span className='animate-dot'>.</span>
          </span>
        </div>
        {details?.progress && (
          <div className='text-sm text-primary'>{details.progress}</div>
        )}
        {details?.plan && (
          <div className='text-sm text-primary mt-1'>Plan: {details.plan}</div>
        )}
      </div>
    </div>
  );
};

export default Analyzer;
