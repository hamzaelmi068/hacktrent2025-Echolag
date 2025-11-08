"use client";

import { useState } from "react";

interface CTATooltipProps {
  children: React.ReactNode;
  tooltipText: string;
}

const CTATooltip = ({ children, tooltipText }: CTATooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50 animate-fade-in">
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45"></div>
          {tooltipText}
        </div>
      )}
    </div>
  );
};

export default CTATooltip;

