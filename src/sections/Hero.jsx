import { Canvas } from "@react-three/fiber";
import {
  Environment,
  Float,
  Lightformer,
  OrbitControls,
} from "@react-three/drei";
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

  return (
    <>
      <section id="home" className="flex flex-col justify-end min-h-screen">
        <div className="relative z-10 pointer-events-none">
          <AnimatedHeaderSection
            subTitle={"404 No Bugs Found"}
            title={"Hon Chow"}
            text={text}
            withScrollTrigger={false}
            textColor={"text-white"}
            explosionProgress={scrollY / 100}
          />
        </div>
        <figure className="absolute inset-0 z-0" style={{ width: "100vw" }}>
          <Canvas
            shadows
            camera={{ position: [0, 0, 200], fov: 50, near: 2, far: 1000 }}
          >
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate={true}
              rotateSpeed={0.5}
            />
            <ambientLight intensity={0.9} />

            <Environment resolution={256}>
              <group rotation={[-Math.PI / 3, 4, 2]}>
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
            <GlobeViz />
          </Canvas>
        </figure>
      </section>
    </>
  );
};

export default Hero;
