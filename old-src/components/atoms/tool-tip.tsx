import React, { useState } from "react";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: "top" | "right" | "bottom" | "left";
}

const Tooltip = ({ text, children, position = "top" }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const positionStyles = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
  };

  return (
    <div
      className='relative inline-flex items-center'
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-10 px-3 py-2 text-sm text-white bg-gray-800 rounded-md shadow-md sm:w-[10vw] lg:w-[18vw] ${
            expanded ? "sm:h-auto lg:h-auto" : "sm:h-[9vh] lg:h-[9vh]"
          } ${positionStyles[position]}`}
        >
          <div
            className={`${expanded ? "" : "overflow-hidden text-ellipsis"} ${
              expanded ? "h-auto" : "max-h-[calc(10vh-50px)]"
            }`}
          >
            {text}
          </div>
          {text.length > 50 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className='mt-1 text-xs text-blue-300 hover:text-blue-200 focus:outline-none'
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
          <div
            className={`absolute ${
              position === "top"
                ? "top-full left-1/2 transform -translate-x-1/2 border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent border-8"
                : position === "right"
                ? "right-full top-1/2 transform -translate-y-1/2 border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent border-8"
                : position === "bottom"
                ? "bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent border-8"
                : "left-full top-1/2 transform -translate-y-1/2 border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent border-8"
            }`}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
