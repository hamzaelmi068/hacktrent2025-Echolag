import { ReactNode } from "react";

interface MastheadProps {
  title: string;
  subtitle?: string;
  navigationSlot?: ReactNode;
}

const Masthead = ({ title, subtitle, navigationSlot }: MastheadProps) => {
  return (
    <header 
      className="flex flex-col gap-4 text-white py-6 px-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      style={{ backgroundColor: '#6B7D5C' }}
    >
      <div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{subtitle}</p>
        ) : null}
      </div>
      {navigationSlot ? (
        <nav aria-label="Page navigation">{navigationSlot}</nav>
      ) : null}
    </header>
  );
};

export default Masthead;

