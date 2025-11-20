import { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * AutoCamera component that automatically calculates and sets optimal camera position and FOV
 * based on the bounding box of the scene or a specific target object.
 *
 * @param {Object} props
 * @param {THREE.Object3D} props.target - Optional target object to frame. If not provided, frames all objects in scene.
 * @param {number} props.padding - Padding factor around the object (default: 1.5)
 * @param {number} props.fov - Desired field of view (default: 50)
 * @param {boolean} props.autoRotate - Whether to automatically rotate around the object (default: false)
 * @param {number} props.rotationSpeed - Rotation speed if autoRotate is enabled (default: 0.5)
 */
export function AutoCamera({
  target = null,
  padding = 1.5,
  fov = 50,
  autoRotate = false,
  rotationSpeed = 0.5,
}) {
  const { camera, scene } = useThree();
  const targetRef = useRef(target);
  const hasCalculated = useRef(false);
  const centerRef = useRef(new THREE.Vector3(0, 0, 0));
  const radiusRef = useRef(0);
  const heightRef = useRef(0);
  const [isReady, setIsReady] = useState(false);
  const frameCountRef = useRef(0);
  const boundingBoxSamplesRef = useRef([]);
  const maxSamplesRef = useRef(30); // Sample over ~0.5 seconds at 60fps to capture animation range

  // Update target ref when prop changes
  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  // Calculate optimal camera position based on bounding box
  const calculateCameraPosition = (sampleBox = null) => {
    const box = sampleBox || new THREE.Box3();
    let hasGeometry = false;

    // For animated models, sample the bounding box over multiple frames
    // to capture the full animation range
    if (!sampleBox) {
      scene.traverse((child) => {
        if (child.isMesh || child.isSkinnedMesh) {
          // Update world matrix to get current animated position
          child.updateMatrixWorld(true);
          const childBox = new THREE.Box3();
          childBox.setFromObject(child);
          if (!childBox.isEmpty()) {
            // Expand box to include childBox by expanding with its corners
            box.expandByPoint(childBox.min);
            box.expandByPoint(childBox.max);
            hasGeometry = true;
          }
        }
      });
    } else {
      // If sampleBox is provided, it already contains geometry
      hasGeometry = !box.isEmpty();
    }

    // If no geometry found, return null
    if (!hasGeometry || box.isEmpty()) {
      return null;
    }

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // Calculate distance based on FOV and object size
    // Formula: distance = (objectSize / 2) / tan(fov / 2) * padding
    const distance =
      (maxDim / 2 / Math.tan((fov * Math.PI) / 180 / 2)) * padding;

    // Position camera slightly above and in front for better viewing angle
    const position = [
      center.x,
      center.y + size.y * 0.2, // Slightly above center
      center.z + distance,
    ];

    return { position, fov, center, size };
  };

  // Try to calculate camera position, retry if model not loaded yet
  // For animated models, sample bounding box over multiple frames
  useFrame(() => {
    if (!hasCalculated.current) {
      // If target ref was provided but is null, try to find it in the scene
      if (target && !targetRef.current) {
        scene.traverse((child) => {
          if (child.type === "Group" && child.children.length > 0) {
            targetRef.current = child;
          }
        });
      }

      // Sample bounding box over multiple frames to capture animation range
      const currentBox = new THREE.Box3();
      let hasGeometry = false;

      scene.traverse((child) => {
        if (child.isMesh || child.isSkinnedMesh) {
          child.updateMatrixWorld(true);
          const childBox = new THREE.Box3();
          childBox.setFromObject(child);
          if (!childBox.isEmpty()) {
            // Expand currentBox to include childBox by expanding with its corners
            currentBox.expandByPoint(childBox.min);
            currentBox.expandByPoint(childBox.max);
            hasGeometry = true;
          }
        }
      });

      if (hasGeometry && !currentBox.isEmpty()) {
        // Store this sample
        boundingBoxSamplesRef.current.push(currentBox.clone());
        frameCountRef.current++;

        // Once we've sampled enough frames, calculate final position
        if (frameCountRef.current >= maxSamplesRef.current) {
          // Combine all samples into one bounding box
          const finalBox = new THREE.Box3();
          boundingBoxSamplesRef.current.forEach((sampleBox) => {
            // Expand finalBox to include each sample box
            finalBox.expandByPoint(sampleBox.min);
            finalBox.expandByPoint(sampleBox.max);
          });

          const result = calculateCameraPosition(finalBox);
          if (result) {
            camera.position.set(...result.position);
            camera.fov = result.fov;
            camera.updateProjectionMatrix();
            centerRef.current.copy(result.center);

            // Store initial radius and height for rotation
            const initialPos = new THREE.Vector3(...result.position);
            radiusRef.current = Math.sqrt(
              Math.pow(initialPos.x - result.center.x, 2) +
                Math.pow(initialPos.z - result.center.z, 2)
            );
            heightRef.current = result.position[1]; // Store Y position

            hasCalculated.current = true;
            setIsReady(true);

            // Log optimal camera settings for reference
            console.log("Optimal camera settings:", {
              position: result.position,
              fov: result.fov,
              center: result.center.toArray(),
              size: result.size.toArray(),
            });
          }
        }
      }
    }
  });

  // Optional auto-rotation
  useFrame((state) => {
    if (autoRotate && hasCalculated.current && isReady) {
      const angle = state.clock.elapsedTime * rotationSpeed;

      // Use stored radius and height to maintain consistent distance
      camera.position.x =
        centerRef.current.x + Math.sin(angle) * radiusRef.current;
      camera.position.z =
        centerRef.current.z + Math.cos(angle) * radiusRef.current;
      camera.position.y = heightRef.current; // Maintain initial height
      camera.lookAt(centerRef.current);
    }
  });

  return null;
}
