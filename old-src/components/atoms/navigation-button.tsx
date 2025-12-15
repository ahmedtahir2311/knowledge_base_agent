import React from "react";
import { ArrowLeftIcon, ArrowRightIcon, Loader2 } from "lucide-react";

interface NavigationButtonProps {
  type: "back" | "next" | "submit";
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const NavigationButton = ({
  type,
  onClick,
  disabled = false,
  isLoading = false,
}: NavigationButtonProps) => {
  const getButtonStyles = () => {
    switch (type) {
      case "back":
        return "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50";
      case "next":
      case "submit":
        return "bg-black text-white hover:bg-gray-800";
      default:
        return "";
    }
  };

  const getButtonText = () => {
    switch (type) {
      case "back":
        return "Back";
      case "next":
        return "Next";
      case "submit":
        return "Submit";
      default:
        return "";
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${getButtonStyles()} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {type === "back" && <ArrowLeftIcon className='mr-2' size={20} />}
      {isLoading ? (
        <Loader2 className='ml-2 animate-spin' size={20} />
      ) : (
        getButtonText()
      )}
      {(type === "next" || type === "submit") && !isLoading && (
        <ArrowRightIcon className='ml-2' size={20} />
      )}
    </button>
  );
};

export default NavigationButton;
