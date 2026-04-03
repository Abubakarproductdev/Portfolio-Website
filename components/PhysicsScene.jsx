"use client";

import { useRef, useEffect, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Preload, useTexture } from "@react-three/drei";
import { Physics, useSphere } from "@react-three/cannon";
import { PHYSICS_ENVIRONMENT, PHYSICS_TEXTURES } from "../lib/homePreload";

const rfs = THREE.MathUtils.randFloatSpread;

// Highly optimized geometry (16x16) to ensure mobile phones hit 60fps
const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
const baubleVec = new THREE.Vector3();

useTexture.preload(PHYSICS_TEXTURES);

export default function PhysicsScene({ onLoaded }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Canvas
      shadows
      gl={{ antialias: true, alpha: true }}
      dpr={1}
      camera={{ position: [0, 0, isMobile ? 35 : 20], fov: 35, near: 1, far: 60 }}
    >
      <ambientLight intensity={0.5} />
      <spotLight intensity={1} angle={0.2} penumbra={1} position={[30, 30, 30]} castShadow shadow-mapSize={[512, 512]} />

      <Suspense fallback={null}>
        <Physics gravity={[0, 2, 0]} iterations={5}>
          <Pointer />
          <Clump onLoaded={onLoaded} />
        </Physics>

        <Environment files={PHYSICS_ENVIRONMENT} />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}

function Clump({ onLoaded }) {
  const textures = useTexture(PHYSICS_TEXTURES);

  useEffect(() => {
    onLoaded?.();
  }, [onLoaded]);

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
    position: [rfs(20), rfs(20), rfs(20)],
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
