import { Canvas } from "@react-three/fiber";
import { Environment, Float, Lightformer, OrbitControls } from "@react-three/drei";
import { useMediaQuery } from "react-responsive";
import { useState, useEffect } from "react";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import { BackgroundBeamsWithCollision } from "../components/ui/background-beams-with-collision";
import { GlobeViz } from "../components/Globe.jsx";

const Hero = () => {
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const [scrollY, setScrollY] = useState(0);
  
  const text = `I help growing brands and startups gain an
unfair advantage through premium
results driven webs/apps`;

  // Track scroll for color change
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate text color based on explosion progress (0-300px scroll)
  const explosionProgress = Math.min(scrollY / 300, 1); // 0 to 1
  const getTextColor = () => {
    if (explosionProgress === 0) return "text-white";
    if (explosionProgress === 1) return "text-green-400";
    // Return inline style for gradient transition
    return "";
  };

  const getInlineStyle = () => {
    if (explosionProgress > 0 && explosionProgress < 1) {
      // Interpolate from white (255,255,255) to green (74,222,128)
      const r = Math.round(255 - (255 - 74) * explosionProgress);
      const g = Math.round(255 - (255 - 222) * explosionProgress);
      const b = Math.round(255 - (255 - 128) * explosionProgress);
      return { color: `rgb(${r}, ${g}, ${b})` };
    }
    return {};
  };

  return (
    <section id="home" className="flex flex-col justify-end min-h-screen">
      <div className="relative z-10 pointer-events-none">
        <AnimatedHeaderSection
          subTitle={"404 No Bugs Found"}
          title={"Ali Sanati"}
          text={text}
          textColor={getTextColor()}
          explosionProgress={explosionProgress}
        />
      </div>
      <figure
        className="absolute inset-0 z-0"
        style={{ width: "100vw", height: "100vh" }}
      >
        <Canvas
          shadows
          camera={{ position: [0, 0, 200], fov: 50, near: 1, far: 1000 }}
        >
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.5}
          />
          <ambientLight intensity={0.5} />
          <GlobeViz />
          <Environment resolution={256}>
            <group rotation={[-Math.PI / 3, 4, 1]}>
              <Lightformer
                form={"circle"}
                intensity={2}
                position={[0, 5, -9]}
                scale={10}
              />
              <Lightformer
                form={"circle"}
                intensity={2}
                position={[0, 3, 1]}
                scale={10}
              />
              <Lightformer
                form={"circle"}
                intensity={2}
                position={[-5, -1, -1]}
                scale={10}
              />
              <Lightformer
                form={"circle"}
                intensity={2}
                position={[10, 1, 0]}
                scale={16}
              />
            </group>
          </Environment>
        </Canvas>
      </figure>
    </section>
  );
};

export default Hero;
