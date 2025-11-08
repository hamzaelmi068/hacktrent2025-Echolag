import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => {
  const baseStyles =
    "rounded-2xl shadow-sm border p-8 hover:shadow-md transition-all duration-300";
  const composedClassName = [baseStyles, className].filter(Boolean).join(" ");
  
  return (
    <section 
      className={composedClassName}
      style={{
        backgroundColor: '#FAF8F3',
        borderColor: '#E5E0D6'
      }}
    >
      {children}
    </section>
  );
};

export default Card;

