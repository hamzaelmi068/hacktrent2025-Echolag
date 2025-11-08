"use client";

interface PrimaryButtonProps {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "neutral";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}

const variantStyles: Record<
  NonNullable<PrimaryButtonProps["variant"]>,
  string
> = {
  primary:
    "bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:from-blue-700 hover:to-teal-600 hover:animate-pulse focus-visible:outline-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500",
  neutral:
    "bg-slate-200 text-slate-900 hover:bg-slate-300 focus-visible:outline-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400",
};

const PrimaryButton = ({
  label,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  className,
}: PrimaryButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-none";
  const variantClass = variantStyles[variant];
  const composedClassName = [baseStyles, variantClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={composedClassName}
      aria-label={label}
    >
      {label}
    </button>
  );
};

export default PrimaryButton;

