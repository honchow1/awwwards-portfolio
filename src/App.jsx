import React, { useEffect, useState } from "react";
import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import ServiceSummary from "./sections/ServiceSummary";
import Services from "./sections/Services";
import ReactLenis from "lenis/react";
import About from "./sections/About";
import Works from "./sections/Works";
import ContactSummary from "./sections/ContactSummary";
import Contact from "./sections/Contact";
import { useProgress } from "@react-three/drei";
import { StarsBackground } from "@/components/animate-ui/components/backgrounds/stars";

import { cn } from "./lib/utils";

const App = () => {
  const { progress } = useProgress();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (progress === 100) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <>
      <ReactLenis
        root
        className="relative w-screen min-h-screen overflow-x-auto"
      >
        {/* Loader overlay */}
        {!isReady && (
          <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black text-white transition-opacity duration-700 font-light">
            <p className="mb-4 text-xl tracking-widest animate-pulse">
              Loading {Math.floor(progress)}%
            </p>
            <div className="relative h-1 overflow-hidden rounded w-60 bg-white/20">
              <div
                className="absolute top-0 left-0 h-full transition-all duration-700 bg-white"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div
          className={`${
            isReady ? "opacity-100" : "opacity-0 pointer-events-none"
          } transition-opacity  duration-5000`}
        >
          <StarsBackground
            starColor="#FFF"
            className={cn(
              "absolute  inset-0 flex items-center justify-center rounded-xl bg-black h-screen",
              "animate-gradient bg-linear-to-b from-black-900 via-gray-900 to-black bg-cover bg-center mask-b-from-40% mask-b-to-80%"
            )}
          />

          <Navbar />
          <Hero />

          <ServiceSummary />
          <Services />
          <About />

          <Works />
          <ContactSummary />
          <Contact />
        </div>
      </ReactLenis>
    </>
  );
};

export default App;
