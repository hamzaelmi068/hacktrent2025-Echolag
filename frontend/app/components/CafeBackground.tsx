"use client";

import { PropsWithChildren } from "react";

type CafeBackgroundProps = PropsWithChildren<{
  variant?: "day" | "night";
}>;

const gradientByVariant: Record<CafeBackgroundProps["variant"], string> = {
  day: "linear-gradient(180deg, #F4E3CB 0%, #F0D7B3 38%, #E6C59B 68%, #D6B082 100%)",
  night: "linear-gradient(180deg, #1F2B36 0%, #1B242E 40%, #111820 100%)",
};

const CafeBackground = ({ children, variant = "day" }: CafeBackgroundProps) => {
  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{
        background: gradientByVariant[variant],
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 45%), repeating-linear-gradient(120deg, rgba(101,75,55,0.12), rgba(101,75,55,0.12) 8px, rgba(255,255,255,0.05) 8px, rgba(255,255,255,0.05) 16px)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 flex justify-center gap-24 pt-10"
      >
        {[...Array(3)].map((_, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="relative h-24 w-24"
          >
            <div className="mx-auto h-12 w-1 bg-[#664E3A]/60" />
            <div className="mx-auto h-10 w-10 rounded-full bg-[#EBD0AA] shadow-[0_8px_25px_rgba(235,208,170,0.6)]" />
          </div>
        ))}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: "linear-gradient(180deg, rgba(82,55,33,0) 0%, rgba(82,55,33,0.55) 60%, rgba(57,38,24,0.85) 100%)",
          boxShadow: "0 -60px 140px rgba(52,34,22,0.55)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 flex h-56 items-end justify-center gap-10 px-12"
      >
        <div className="h-40 w-72 rounded-t-[28px] bg-[#CFA676] shadow-[0_4px_35px_rgba(49,30,16,0.35)]">
          <div className="mx-auto mt-6 h-6 w-20 rounded-full bg-[#B88B58]" />
        </div>
        <div className="h-48 w-80 rounded-t-[30px] bg-[#D8B183] shadow-[0_4px_35px_rgba(49,30,16,0.35)]">
          <div className="mx-auto mt-6 flex w-32 items-center justify-around">
            <div className="h-6 w-6 rounded-full bg-[#8F5D36]" />
            <div className="h-6 w-6 rounded-full bg-[#8F5D36]" />
            <div className="h-6 w-6 rounded-full bg-[#8F5D36]" />
          </div>
        </div>
        <div className="h-36 w-64 rounded-t-[26px] bg-[#CFA676] shadow-[0_4px_35px_rgba(49,30,16,0.35)]" />
      </div>

      <div className="relative z-10 flex-1">{children}</div>
    </div>
  );
};

export default CafeBackground;

