import { useFrame } from "@react-three/fiber";
import R3fGlobe from "r3f-globe";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as satellite from "satellite.js";
import * as THREE from "three";

const EARTH_RADIUS_KM = 6371;
const TIME_STEP = 3 * 1000;

// Custom flashing and glowing London beacon
const FlashingBeacon = ({ globeRef }) => {
  const beaconRef = useRef();
  const glowRef = useRef();
  const pulseRef = useRef();
  const [position, setPosition] = useState(null);

  // Get correct position from globe once it's loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (
          globeRef?.current &&
          typeof globeRef.current.getCoords === "function"
        ) {
          const coords = globeRef.current.getCoords(51.5074, -0.1278, 0.01);
          if (coords) {
            setPosition([coords.x, coords.y, coords.z]);
          }
        }
      } catch (e) {
        // Globe not ready yet, will retry on next mount
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [globeRef]);

  useFrame((state) => {
    if (!position) return;

    const blink = Math.sin(state.clock.elapsedTime * 12) * 0.5 + 0.5;
    const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.3 + 0.7;

    if (beaconRef.current) {
      beaconRef.current.material.opacity = 0.7 + blink * 0.3;
    }

    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + pulse * 1.5);
      glowRef.current.material.opacity = pulse * 0.5;
    }

    if (pulseRef.current) {
      pulseRef.current.scale.setScalar(0.8 + pulse * 0.8);
      pulseRef.current.material.opacity = blink * 0.5;
    }
  });

  if (!position) return null;

  return (
    <group position={position}>
      {/* Core beacon - fast blink */}
      <mesh ref={beaconRef}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial color="#ff0044" transparent />
      </mesh>

      {/* Inner pulse ring */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial
          color="#ff3366"
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer glow - slow pulse */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[5, 16, 16]} />
        <meshBasicMaterial color="#ff6699" transparent side={THREE.BackSide} />
      </mesh>

      {/* Bright center point */}
      <mesh>
        <sphereGeometry args={[1.2, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

// Custom Satellite Renderer Component
const SatellitePoints = ({ satellites, scrollY }) => {
  const pointsRef = useRef();
  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  const timeRef = useRef(new Date());

  useFrame(({ camera }, delta) => {
    if (!pointsRef.current || satellites.length === 0) return;

    // Advance time for satellite motion (speed up by 60x for visible movement)
    timeRef.current = new Date(+timeRef.current + delta * 60000);
    const time = timeRef.current;

    const positions = [];
    const cameraPos = camera.position.clone();

    // Calculate explosion factor based on scroll (0 to 2x expansion)
    const explosionFactor = 1 + scrollY * 0.003;

    satellites.forEach(({ satrec }) => {
      try {
        const positionAndVelocity = satellite.propagate(satrec, time);

        if (
          positionAndVelocity.position &&
          typeof positionAndVelocity.position.x === "number" &&
          !positionAndVelocity.position.error
        ) {
          const gmst = satellite.gstime(time);
          const geoCoords = satellite.eciToGeodetic(
            positionAndVelocity.position,
            gmst
          );

          // Convert to lat/lng/alt
          const lat = geoCoords.latitude * (180 / Math.PI);
          const lng = geoCoords.longitude * (180 / Math.PI);
          const alt = geoCoords.height;

          // Validate all values are numbers (not NaN)
          if (
            !isNaN(lat) &&
            !isNaN(lng) &&
            !isNaN(alt) &&
            isFinite(lat) &&
            isFinite(lng) &&
            isFinite(alt)
          ) {
            // Convert to 3D Cartesian coordinates
            // Globe radius is approximately 100 units, satellites should be 10-20% further out
            const globeRadius = 100;
            const altitudeScale = alt / EARTH_RADIUS_KM; // Normalize altitude
            const radius = globeRadius * (1 + altitudeScale * 0.3 + 0.15); // Add 15% base + scaled altitude
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lng + 180) * (Math.PI / 180);

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.cos(phi);
            const z = radius * Math.sin(phi) * Math.sin(theta);

            // Final validation of 3D coordinates
            if (
              !isNaN(x) &&
              !isNaN(y) &&
              !isNaN(z) &&
              isFinite(x) &&
              isFinite(y) &&
              isFinite(z)
            ) {
              // Calculate if satellite is on visible hemisphere (facing camera)
              const satVector = new THREE.Vector3(x, y, z);
              const toCamera = cameraPos.clone().sub(satVector).normalize();
              const dotProduct = satVector.clone().normalize().dot(toCamera);

              // Only render satellites facing toward camera (positive dot = facing camera)
              if (dotProduct > 0) {
                // Apply explosion effect - push satellites outward from center
                const explodedX = x * explosionFactor;
                const explodedY = y * explosionFactor;
                const explodedZ = z * explosionFactor;

                positions.push(explodedX, explodedY, explodedZ);
              }
            }
          }
        }
      } catch (e) {
        // Skip invalid satellites
      }
    });

    if (positions.length > 0) {
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      geometry.attributes.position.needsUpdate = true;
    }
  });

  if (satellites.length === 0) return null;

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={1.2}
        color="#00ffaa"
        sizeAttenuation={false}
        transparent={false}
        depthTest={true}
        depthWrite={true}
      />
    </points>
  );
};

export const GlobeViz = () => {
  const globeRef = useRef(null);
  const r3fGlobeRef = useRef();
  const [satellites, setSatellites] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const animationStateRef = useRef({
    startY: 50,
    targetY: 0,
    currentTime: 0,
    duration: 3,
    isDropping: true,
    floatPhase: 0,
  });

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load TLE data
  useEffect(() => {
    fetch("/models/Globe/space-track-leo.txt")
      .then((res) => res.text())
      .then((rawData) => {
        const lines = rawData.split("\n").filter((line) => line.trim());
        const sats = [];

        for (let i = 0; i < lines.length; i += 3) {
          if (i + 2 < lines.length) {
            const name = lines[i].trim().replace(/^0\s+/, "");
            const line1 = lines[i + 1].trim();
            const line2 = lines[i + 2].trim();

            if (line1.startsWith("1") && line2.startsWith("2")) {
              try {
                const satrec = satellite.twoline2satrec(line1, line2);
                sats.push({
                  satrec: satrec,
                  name: name,
                });
              } catch (e) {
                // Skip invalid satellite data
              }
            }
          }
        }

        setSatellites(sats);
      })
      .catch((err) => console.error("Failed to load TLE data:", err));
  }, []);

  // Animation loop for globe drop and scroll
  useFrame((state, delta) => {
    if (!globeRef.current) return;

    const anim = animationStateRef.current;

    if (anim.isDropping) {
      anim.currentTime += delta;
      const progress = Math.min(anim.currentTime / anim.duration, 1);

      // Smooth easeOutCubic function - starts fast, ends slow
      const easeOutCubic = (t) => {
        return 1 - Math.pow(1 - t, 3);
      };

      const easedProgress = easeOutCubic(progress);
      const dropY = anim.startY - (anim.startY - anim.targetY) * easedProgress;

      // Delay globe flying up until after satellites explode (after 300px scroll)
      const scrollThreshold = 300;
      const scrollOffset = Math.max(0, (scrollY - scrollThreshold) * 0.5);
      globeRef.current.position.y = dropY + scrollOffset;

      if (progress >= 1) {
        anim.isDropping = false;
      }
    } else {
      // Floating animation + delayed scroll offset
      anim.floatPhase += delta * 0.5;
      const floatY = Math.sin(anim.floatPhase) * 2;

      // Delay globe flying up until after satellites explode (after 300px scroll)
      const scrollThreshold = 300;
      const scrollOffset = Math.max(0, (scrollY - scrollThreshold) * 0.5);
      globeRef.current.position.y = floatY + scrollOffset;
    }
  });

  return (
    <group ref={globeRef} scale={0.5}>
      <R3fGlobe
        ref={r3fGlobeRef}
        globeImageUrl="https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
      />
      <SatellitePoints satellites={satellites} scrollY={scrollY} />
      <FlashingBeacon globeRef={r3fGlobeRef} />
    </group>
  );
};

export const GlobeVizScene = () => {
  return (
    <div style={{ height: window.innerHeight }}>
      <Canvas
        flat
        camera={useMemo(() => ({ position: [0, 0, 250] }), [])}
        raycaster={useMemo(
          () => ({ params: { Points: { threshold: 0.2 } } }),
          []
        )}
      >
        <OrbitControls
          minDistance={101}
          maxDistance={1e4}
          dampingFactor={0.1}
          zoomSpeed={0.3}
          rotateSpeed={0.3}
        />
        <color attach="background" args={[0, 0, 0]} />
        <ambientLight intensity={Math.PI} />
        <directionalLight intensity={0.6 * Math.PI} />
        <GlobeViz />
      </Canvas>
    </div>
  );
};
