"use client";

import { motion } from "framer-motion";

const FloatingShapes = () => {
  const shapes = [
    {
      size: 120,
      left: "10%",
      top: "20%",
      color: "bg-blue-200",
      duration: 8,
      delay: 0,
    },
    {
      size: 80,
      left: "80%",
      top: "40%",
      color: "bg-teal-200",
      duration: 10,
      delay: 2,
    },
    {
      size: 100,
      left: "15%",
      top: "70%",
      color: "bg-purple-200",
      duration: 12,
      delay: 4,
    },
    {
      size: 90,
      left: "85%",
      top: "80%",
      color: "bg-blue-300",
      duration: 9,
      delay: 1,
    },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          className={`absolute ${shape.color} rounded-full blur-xl`}
          style={{
            width: shape.size,
            height: shape.size,
            left: shape.left,
            top: shape.top,
            opacity: 0.05,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: shape.delay,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingShapes;

