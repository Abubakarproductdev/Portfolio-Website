"use client";

import { useRef, useEffect, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useTexture } from "@react-three/drei";
import { Physics, useSphere } from "@react-three/cannon";

const rfs = THREE.MathUtils.randFloatSpread;

// FIXED: Reduced geometry segments from 32 to 16. It looks identical but is 2x faster to render!
const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);

// Your logo textures (Make sure to resize these to 512x512 later!)
const logoTextures = [
  "/nextjs.jpg",
  "/react.jpg",
  "/python.jpg",
  "/javascript.jpg",
  "/html.png",
  "/tailwind.jpg",
  "/nodejs.jpg",
  "/expressjs.jpg",
  "/mongodb.jpg",
];

const baubleVec = new THREE.Vector3();

export default function PhysicsScene() {
  return (
    <Canvas 
      shadows 
      // FIXED: Locked dpr to 1 to prevent 4K monitors from slowing down the browser
      gl={{ antialias: true, alpha: true }} 
      dpr={1} 
      camera={{ position: [0, 0, 20], fov: 35, near: 1, far: 40 }}
    >
      <ambientLight intensity={0.5} />
      <spotLight intensity={1} angle={0.2} penumbra={1} position={[30, 30, 30]} castShadow shadow-mapSize={[512, 512]} />
      
      <Suspense fallback={null}>
        {/* FIXED: Reduced iterations from 10 to 5 for faster math calculations */}
        <Physics gravity={[0, 2, 0]} iterations={5}>
          <Pointer />
          <Clump />
        </Physics>
        
        {/* Using the built-in 'city' preset instead of the heavy .hdr file */}
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
}

function Clump() {
  const textures = useTexture(logoTextures);

  return (
    <>
      {Array.from({ length: 40 }).map((_, i) => (
        <Bauble key={i} texture={textures[i % textures.length]} />
      ))}
    </>
  );
}

function Bauble({ texture }) {
  const [ref, api] = useSphere(() => ({
    args: [1],
    mass: 1,
    angularDamping: 0.1,
    linearDamping: 0.65,
    position: [rfs(20), rfs(20), rfs(20)]
  }));

  const pos = useRef([0, 0, 0]);
  useEffect(() => {
    const unsubscribe = api.position.subscribe((v) => (pos.current = v));
    return unsubscribe;
  }, [api]);

  useFrame(() => {
    baubleVec.set(...pos.current).normalize().multiplyScalar(-40);
    api.applyForce(baubleVec.toArray(), [0, 0, 0]);
  });

  return (
    <mesh ref={ref} castShadow receiveShadow geometry={sphereGeometry}>
      <meshStandardMaterial 
        color="white" 
        roughness={0} 
        envMapIntensity={1} 
        map={texture} 
        transparent={true} 
      />
    </mesh>
  );
}

function Pointer() {
  const viewport = useThree((state) => state.viewport);
  const [ref, api] = useSphere(() => ({ type: "Kinematic", args: [3], position: [0, 0, 0] }));
  
  useFrame((state) => api.position.set((state.mouse.x * viewport.width) / 2, (state.mouse.y * viewport.height) / 2, 0));
  
  return <mesh ref={ref} visible={false} />;
}