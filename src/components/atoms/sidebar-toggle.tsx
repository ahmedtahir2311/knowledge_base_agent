"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarToggleProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export default function SidebarToggle({
  isOpen,
  onClick,
  className = "",
}: SidebarToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`absolute -right-3 transform bg-background text-primary rounded-full p-1 shadow-md hover:opacity-80 ${className}`}
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
    >
      {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </button>
  );
}
