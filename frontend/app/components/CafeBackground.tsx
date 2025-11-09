"use client";

import { PropsWithChildren } from "react";

type CafeBackgroundProps = PropsWithChildren<{
  variant?: "day" | "night";
}>;

const CafeBackground = ({ children }: PropsWithChildren) => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-amber-50 to-orange-100" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-orange-100/50" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(120deg, rgba(139, 69, 19, 0.12), rgba(139, 69, 19, 0.12) 8px, rgba(255,255,255,0.05) 8px, rgba(255,255,255,0.05) 16px)",
        }}
      />

      <div className="relative z-10 flex-1">{children}</div>
    </div>
  );
};

export default CafeBackground;
