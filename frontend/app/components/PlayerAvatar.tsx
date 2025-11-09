"use client";

import clsx from "clsx";
import { HTMLAttributes } from "react";

type PlayerAvatarProps = HTMLAttributes<HTMLDivElement> & {
  mood?: "neutral" | "focused" | "celebrate";
  primaryColor?: string;
  accentColor?: string;
};

const PlayerAvatar = ({
  className,
  mood = "focused",
  primaryColor = "#3B4A53",
  accentColor = "#E7B15E",
  ...props
}: PlayerAvatarProps) => {
  return (
    <div
      className={clsx(
        "relative flex h-40 w-32 flex-col items-center justify-end rounded-3xl p-4",
        "shadow-[0_18px_45px_rgba(35,27,22,0.28)]",
        className
      )}
      style={{
        background: `linear-gradient(180deg, ${primaryColor} 0%, #1F262C 100%)`,
      }}
      {...props}
    >
      <div className="relative flex h-24 w-full flex-col items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F7E4D0] shadow-inner shadow-[rgba(0,0,0,0.1)]">
          <div className="relative h-16 w-16 rounded-full bg-[#F8DFC9]">
            <div className="absolute inset-x-3 top-6 flex justify-between">
              <span className="h-2 w-4 rounded-full bg-[#2C1E10]" />
              <span className="h-2 w-4 rounded-full bg-[#2C1E10]" />
            </div>
            <div
              className="absolute left-1/2 top-11 h-2 w-8 -translate-x-1/2 rounded-full"
              style={{
                backgroundColor: "#6F4B2B",
                transform:
                  mood === "neutral"
                    ? "translate(-50%, 0)"
                    : mood === "focused"
                    ? "translate(-50%, 2px) scaleY(0.8)"
                    : "translate(-50%, -2px) scaleY(1.2)",
              }}
            />
            <div className="absolute inset-x-1 top-2 h-6 rounded-full bg-[#2D3A42]" />
            <div className="absolute -bottom-2 left-1/2 h-6 w-16 -translate-x-1/2 rounded-full bg-[#DDA56F]" />
          </div>
        </div>

        <div className="mt-2 flex w-24 items-center justify-center gap-2">
          <div className="h-6 w-6 rounded-full bg-white/20" />
          <div className="h-6 flex-1 rounded-full bg-white/25" />
        </div>
      </div>

      <div className="mt-3 flex h-6 w-full items-center justify-center gap-2">
        <span className="h-2 flex-1 rounded-full bg-white/30" />
        <span className="h-2 w-5 rounded-full bg-white/20" />
        <span className="h-2 w-5 rounded-full bg-white/30" />
      </div>

      <div
        className="absolute -bottom-2 h-6 w-32 rounded-full blur-md"
        style={{
          backgroundColor: accentColor,
          opacity: 0.2,
        }}
      />
    </div>
  );
};

export default PlayerAvatar;

