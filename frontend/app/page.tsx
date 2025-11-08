"use client";

import { useEffect, useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import NavigationBar from "./components/NavigationBar";
import FloatingShapes from "./components/FloatingShapes";
import LoadingSpinner from "./components/LoadingSpinner";

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen text-gray-900 relative bg-white">
      <FloatingShapes />
      <NavigationBar />
      <div className="relative z-10 pt-16">
        <HomeScreen />
      </div>
    </div>
  );
};

export default HomePage;
