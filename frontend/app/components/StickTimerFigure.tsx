"use client"

import { useEffect, useState } from "react"

interface StickFigureTimerProps {
  seconds: number
  isActive: boolean
}

export default function StickFigureTimer({ seconds, isActive }: StickFigureTimerProps) {
  const [animationTime, setAnimationTime] = useState(0)

  useEffect(() => {
    if (!isActive) {
      setAnimationTime(0)
      return
    }

    let frameId: number
    const loop = (time: number) => {
      setAnimationTime(time)
      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [isActive])

  const easedTime = animationTime / 1000
  const armRotation = isActive ? Math.sin(easedTime * 4.2) * 6 : 0
  const boardSwing = isActive ? Math.sin(easedTime * 3.2) * 3 : 0
  const boardBob = isActive ? Math.cos(easedTime * 2.6) * 2 : 0
  const shadowScale = isActive ? 1 + Math.sin(easedTime * 3.2) * 0.04 : 1

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 300 400" className="h-full w-full" style={{ maxHeight: "100%", maxWidth: "100%" }}>
        {/* Shadow */}
        <ellipse
          cx="150"
          cy="380"
          rx={40 * shadowScale}
          ry={8 * shadowScale}
          fill="rgba(0, 0, 0, 0.15)"
          className="transition-all duration-150"
        />

        {/* Legs */}
        <line
          x1="150"
          y1="280"
          x2="120"
          y2="360"
          stroke="#1F2937"
          strokeWidth="6"
          strokeLinecap="round"
          className="transition-all duration-300"
        />
        <line
          x1="150"
          y1="280"
          x2="180"
          y2="360"
          stroke="#1F2937"
          strokeWidth="6"
          strokeLinecap="round"
          className="transition-all duration-300"
        />

        {/* Feet */}
        <line x1="120" y1="360" x2="105" y2="365" stroke="#1F2937" strokeWidth="6" strokeLinecap="round" />
        <line x1="180" y1="360" x2="195" y2="365" stroke="#1F2937" strokeWidth="6" strokeLinecap="round" />

        {/* Body */}
        <line
          x1="150"
          y1="180"
          x2="150"
          y2="280"
          stroke="#1F2937"
          strokeWidth="7"
          strokeLinecap="round"
          className="transition-all duration-300"
        />

        {/* Left Arm (holding timer up) */}
        <g
          className="transition-all duration-300"
          style={{ transformOrigin: "150px 190px", transform: `rotate(${armRotation}deg)` }}
        >
          <line
            x1="150"
            y1="190"
            x2="120"
            y2="140"
            stroke="#1F2937"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <line
            x1="120"
            y1="140"
            x2="100"
            y2="100"
            stroke="#1F2937"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>

        {/* Right Arm (holding timer up) */}
        <g
          className="transition-all duration-300"
          style={{ transformOrigin: "150px 190px", transform: `rotate(${-armRotation}deg)` }}
        >
          <line
            x1="150"
            y1="190"
            x2="180"
            y2="140"
            stroke="#1F2937"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <line
            x1="180"
            y1="140"
            x2="200"
            y2="100"
            stroke="#1F2937"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>

        <g
          style={{
            transformOrigin: "150px 53px",
            transform: `translateY(${boardBob}px) rotate(${boardSwing}deg)`,
            transition: isActive ? "none" : "transform 200ms ease-out",
          }}
        >
          {/* Timer board shadow */}
          <rect x="72" y="12" width="156" height="86" rx="12" fill="rgba(0, 0, 0, 0.1)" />

          {/* Timer board */}
          <rect
            x="70"
            y="10"
            width="160"
            height="86"
            rx="12"
            fill="url(#timerGradient)"
            stroke={isActive ? "#2563EB" : "#6B7280"}
            strokeWidth="3"
            className="transition-all duration-300"
          />

          {/* Timer screen inset */}
          <rect x="80" y="20" width="140" height="66" rx="8" fill="#0F172A" className="transition-all duration-300" />

          {/* Glow effect when active */}
          {isActive && (
            <rect
              x="80"
              y="20"
              width="140"
              height="66"
              rx="8"
              fill="url(#glowGradient)"
              opacity="0.3"
              className="animate-pulse"
            />
          )}

          {/* Timer text */}
          <text
            x="150"
            y="63"
            textAnchor="middle"
            fontSize="42"
            fontWeight="900"
            fill={isActive ? "#3B82F6" : "#9CA3AF"}
            fontFamily="monospace"
            className="transition-all duration-300"
          >
            {seconds}
          </text>

          {/* "SEC" label */}
          <text
            x="150"
            y="80"
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill={isActive ? "#60A5FA" : "#6B7280"}
            letterSpacing="2"
            fontFamily="sans-serif"
            className="transition-all duration-300"
          >
            SECONDS
          </text>

          {/* Rope holding timer */}
          <line x1="100" y1="96" x2="100" y2="100" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="200" y1="96" x2="200" y2="100" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Head */}
        <circle
          cx="150"
          cy="150"
          r="30"
          fill="none"
          stroke="#1F2937"
          strokeWidth="6"
          className="transition-all duration-300"
        />

        {/* Eyes */}
        <circle cx="140" cy="145" r="3" fill="#1F2937" />
        <circle cx="160" cy="145" r="3" fill="#1F2937" />

        {/* Mouth - changes based on time remaining */}
        {seconds > 30 ? (
          // Calm/neutral
          <line x1="140" y1="160" x2="160" y2="160" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
        ) : seconds > 10 ? (
          // Slightly worried
          <path d="M 140 162 Q 150 158 160 162" fill="none" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
        ) : (
          // Very worried
          <path d="M 140 165 Q 150 160 160 165" fill="none" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
        )}

        {/* Eyebrows - get more stressed as time runs out */}
        {seconds <= 10 && (
          <>
            <line x1="133" y1="135" x2="143" y2="138" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
            <line x1="157" y1="138" x2="167" y2="135" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {/* Gradients */}
        <defs>
          <linearGradient id="timerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E5E7EB" />
            <stop offset="100%" stopColor="#D1D5DB" />
          </linearGradient>
          <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Status indicator */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest transition-all duration-300 ${
            isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isActive ? "animate-pulse bg-blue-500" : "bg-gray-400"}`} />
          {isActive ? "Running" : "Ready"}
        </div>
      </div>
    </div>
  )
}
