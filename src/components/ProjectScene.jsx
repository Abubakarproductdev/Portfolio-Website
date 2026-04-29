import { onCleanup, onMount } from "solid-js";
import * as THREE from "three";

export default function ProjectScene() {
  let host;
  let frame = 0;
  let renderer;
  let resizeObserver;
  const disposables = [];

  onMount(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const material = new THREE.MeshStandardMaterial({
      color: "#111111",
      metalness: 0.9,
      roughness: 0.2,
      emissive: "#050505",
    });
    const geometry = new THREE.IcosahedronGeometry(1, 16);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.setScalar(1.8);
    scene.add(mesh);
    disposables.push(material, geometry);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    const spot = new THREE.SpotLight(0xffffff, 1, 0, 0.15, 1);
    spot.position.set(10, 10, 10);
    scene.add(ambient, spot);

    const sparkGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(300);
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = THREE.MathUtils.randFloatSpread(10);
      positions[i + 1] = THREE.MathUtils.randFloatSpread(10);
      positions[i + 2] = THREE.MathUtils.randFloatSpread(10);
    }
    sparkGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const sparkMaterial = new THREE.PointsMaterial({
      color: "#ffffff",
      opacity: 0.2,
      transparent: true,
      size: 0.035,
    });
    const sparkles = new THREE.Points(sparkGeometry, sparkMaterial);
    scene.add(sparkles);
    disposables.push(sparkGeometry, sparkMaterial);

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const animate = () => {
      mesh.rotation.x += 0.0018;
      mesh.rotation.y += 0.0027;
      mesh.position.y = Math.sin(performance.now() * 0.001) * 0.12;
      sparkles.rotation.y += 0.0008;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
  });

  onCleanup(() => {
    if (frame) cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    if (renderer?.domElement?.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    renderer?.dispose();
    disposables.forEach((asset) => asset.dispose?.());
  });

  return <div ref={host} class="h-full w-full" />;
}
