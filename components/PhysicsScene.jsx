"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, useSphere } from "@react-three/cannon";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { PHYSICS_ENVIRONMENT, PHYSICS_TEXTURES } from "../lib/homePreload";

const rfs = THREE.MathUtils.randFloatSpread;
const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
const baubleVec = new THREE.Vector3();

function prepareTexture(texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function disposeAssets(assets) {
  if (!assets) return;

  assets.textures.forEach((texture) => texture.dispose());
  assets.environment.dispose();
}

export default function PhysicsScene({ onLoaded }) {
  const [assets, setAssets] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const textureLoader = new THREE.TextureLoader();
    const rgbeLoader = new RGBELoader();

    const loadAssets = async () => {
      const [textures, environment] = await Promise.all([
        Promise.all(PHYSICS_TEXTURES.map((src) => textureLoader.loadAsync(src).then(prepareTexture))),
        rgbeLoader.loadAsync(PHYSICS_ENVIRONMENT).then((texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          texture.needsUpdate = true;
          return texture;
        }),
      ]);

      if (!isMountedRef.current) {
        disposeAssets({ textures, environment });
        return;
      }

      setAssets({ textures, environment });
    };

    loadAssets().catch(() => {
      if (isMountedRef.current) {
        onLoaded?.();
      }
    });

    return () => {
      isMountedRef.current = false;
    };
  }, [onLoaded]);

  useEffect(() => {
    return () => {
      disposeAssets(assets);
    };
  }, [assets]);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Canvas
      shadows
      dpr={[1, 1.25]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, isMobile ? 35 : 20], fov: 35, near: 1, far: 60 }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      {assets ? <SceneContents assets={assets} onLoaded={onLoaded} /> : null}
    </Canvas>
  );
}

function SceneContents({ assets, onLoaded }) {
  const { gl } = useThree();

  const environmentMap = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const texture = pmrem.fromEquirectangular(assets.environment).texture;
    pmrem.dispose();
    return texture;
  }, [assets.environment, gl]);

  useEffect(() => {
    const maxAnisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 8);

    assets.textures.forEach((texture) => {
      texture.anisotropy = maxAnisotropy;
      texture.needsUpdate = true;
    });
  }, [assets.textures, gl]);

  useEffect(() => {
    return () => {
      environmentMap.dispose();
    };
  }, [environmentMap]);

  return (
    <>
      <primitive attach="environment" object={environmentMap} />
      <ambientLight intensity={0.5} />
      <spotLight intensity={1} angle={0.2} penumbra={1} position={[30, 30, 30]} castShadow shadow-mapSize={[512, 512]} />
      <ReadySignal onLoaded={onLoaded} />
      <Physics gravity={[0, 2, 0]} iterations={5}>
        <Pointer />
        <Clump textures={assets.textures} environmentMap={environmentMap} />
      </Physics>
    </>
  );
}

function ReadySignal({ onLoaded }) {
  const hasReportedRef = useRef(false);

  useFrame(() => {
    if (hasReportedRef.current) return;
    hasReportedRef.current = true;
    onLoaded?.();
  });

  return null;
}

function Clump({ textures, environmentMap }) {
  return (
    <>
      {Array.from({ length: 40 }).map((_, i) => (
        <Bauble key={i} texture={textures[i % textures.length]} environmentMap={environmentMap} />
      ))}
    </>
  );
}

function Bauble({ texture, environmentMap }) {
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
        envMap={environmentMap}
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

  useFrame((state) => {
    api.position.set((state.mouse.x * viewport.width) / 2, (state.mouse.y * viewport.height) / 2, 0);
  });

  return <mesh ref={ref} visible={false} />;
}
