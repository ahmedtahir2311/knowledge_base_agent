import React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  steps: {
    id: number;
    label: string;
    completed: boolean;
  }[];
}

const StepIndicator = ({ currentStep, steps }: StepIndicatorProps) => {
  return (
    <div className='w-full max-w-3xl mx-auto mb-8'>
      <div className='flex items-center justify-between relative'>
        {/* Connector lines container - positioned behind circles */}
        <div className='absolute top-6 left-6 w-[calc(100%-80px)] flex'>
          {steps.map((_, index) => {
            if (index < steps.length - 1) {
              return (
                <div
                  key={`connector-${index}`}
                  className={cn(
                    "h-[2px] flex-1",
                    steps[index].completed ? "bg-black" : "bg-gray-200"
                  )}
                />
              );
            }
            return null;
          })}
        </div>

        {/* Steps circles - positioned above lines */}
        {steps.map((step) => (
          <div
            key={step.id}
            className='flex flex-col items-center relative z-10'
          >
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                step.completed
                  ? "bg-black text-white"
                  : currentStep === step.id
                  ? "border-2 border-black text-black bg-white"
                  : "bg-gray-200 text-gray-500"
              )}
            >
              {step.completed ? (
                <CheckIcon />
              ) : (
                <span className='text-lg'>{step.id}</span>
              )}
            </div>
            <span className='mt-2 text-sm font-medium'>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
