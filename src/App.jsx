import React, { useEffect, useState } from "react";
import ReactLenis from "lenis/react";
import { cn } from "./lib/utils";
import { useProgress } from "@react-three/drei";
import { Loader } from "@react-three/drei";
import { StarsBackground } from "@/components/animate-ui/components/backgrounds/stars";
import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import ServiceSummary from "./sections/ServiceSummary";
import Services from "./sections/Services";

import About from "./sections/About";
import Works from "./sections/Works";
import ContactSummary from "./sections/ContactSummary";
import Contact from "./sections/Contact";
import { Suspense } from "react";
const App = () => {
  return (
    <>
      <Loader />

      <ReactLenis
        root
        className="relative w-screen min-h-screen overflow-x-auto"
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
        <About />

        <Services />

        <Works />
        <ContactSummary />
        <Contact />
      </ReactLenis>
    </>
  );
};

export default App;
