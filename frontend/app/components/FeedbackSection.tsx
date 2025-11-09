"use client";

import { useState } from "react";

interface FeedbackSectionProps {
  title: string;
  items: string[];
  icon: string;
  iconColor: string;
  defaultExpanded?: boolean;
}

const FeedbackSection = ({ 
  title, 
  items, 
  icon, 
  iconColor,
  defaultExpanded = true 
}: FeedbackSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="rounded-xl border p-6 shadow-sm" style={{ backgroundColor: '#FAF8F3', borderColor: '#E5E0D6' }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl" style={{ color: iconColor }}>{icon}</span>
          <h3 className="text-lg font-semibold" style={{ color: '#4A3F35' }}>
            {title}
          </h3>
        </div>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          style={{ color: '#6B5D52' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-lg mt-0.5" style={{ color: iconColor }}>•</span>
              <p className="flex-1 leading-relaxed" style={{ color: '#6B5D52' }}>
                {item}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FeedbackSection;

