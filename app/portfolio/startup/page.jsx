'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Environment, Float, Sparkles, Lightformer } from '@react-three/drei';
import { Roboto_Mono } from 'next/font/google';
import Link from 'next/link';
import * as THREE from 'three';

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const projectData = {
  sivo: {
    title: "SIVO",
    subtitle: "Sign to speech & speech to sign",
    description: "SIVO bridges the communication gap between the deaf and hearing communities through advanced AI and computer vision. By translating sign language into spoken words and vice versa in real-time, it creates a seamless integration of two worlds. The system leverages state-of-the-art TensorFlow models and a highly responsive React-Native frontend for an intuitive user experience.",
    tech: { backend: "Python, Flask, TensorFlow", frontend: "React-Native" },
    images: ["https://picsum.photos/seed/sivo1/1920/1080", "https://picsum.photos/seed/sivo2/1920/1080"],
  },
  agrimind: {
    title: "Agrimind",
    subtitle: "AI farmers resource allocation",
    description: "Agrimind revolutionizes modern agriculture by bringing intelligent resource allocation to the fingertips of farmers. Using an ecosystem of specialized AI agents powered by Langgraph, it predicts crop yields, optimizes water usage, and provides real-time market insights. The backend architecture seamlessly connects Python AI modeling with a robust Node.js and MongoDB foundation, while next-generation web technologies deliver actionable insights.",
    tech: { backend: "Python (AI agents), Langgraph, Node.js, MongoDB", frontend: "Next.js, Tailwind" },
    images: ["https://picsum.photos/seed/agrimind1/1920/1080", "https://picsum.photos/seed/agrimind2/1920/1080"],
  },
  quant: {
    title: "Semi-Quant Auto",
    subtitle: "Future market strategy automation",
    description: "A high-performance algorithmic trading system engineered for future markets. Semi-Quant Auto minimizes human error and emotion by automating complex quantitative strategies. Developed purely in Python, the pipeline manages massive streams of market data, executes split-second decisions, and visualizes live performance through dynamic charting dashboards.",
    tech: { backend: "Python", frontend: "Python" },
    images: ["https://picsum.photos/seed/quant1/1920/1080", "https://picsum.photos/seed/quant2/1920/1080"],
  },
  startup: {
    title: "Startup Analyser",
    subtitle: "AI startup analyser using RAG system",
    description: "Startup Analyser provides deep, actionable intelligence on emerging companies by leveraging a sophisticated Retrieval-Augmented Generation (RAG) system. Investors and analysts can explore massive datasets of startup metrics, pitch decks, and market positioning. The system combines Redis caching and MongoDB for extreme speed, presented via a sleek React interface.",
    tech: { backend: "Python, Node.js, Express, MongoDB, Redis", frontend: "React.js" },
    images: ["https://picsum.photos/seed/startup1/1920/1080", "https://picsum.photos/seed/startup2/1920/1080"],
  },
  armall: {
    title: "ArMall.pk",
    subtitle: "Ecommerce website design",
    description: "ArMall is a premium e-commerce platform redefining digital retail with speed, absolute security, and immersive design. The architecture is built on Next.js for lightning-fast server-side rendering, secured by Clerk authentication routines, and scaled globally with MongoDB and Mongoose. The frontend provides a buttery-smooth shopping experience accented by high-contrast brutalist aesthetics.",
    tech: { backend: "Next.js, Mongoose, Clerk, MongoDB", frontend: "Next.js, Tailwind" },
    images: ["https://picsum.photos/seed/armall1/1920/1080", "https://picsum.photos/seed/armall2/1920/1080"],
  }
};

const AbstractShape = () => {
  const meshRef = useRef(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} scale={1.8}>
        <icosahedronGeometry args={[1, 64]} />
        <MeshDistortMaterial
          color="#111111"
          envMapIntensity={2}
          reflectivity={1}
          metalness={0.9}
          roughness={0.2}
          distort={0.4}
          speed={2}
        />
      </mesh>
    </Float>
  );
};

export default function PortfolioPage() {
  const data = projectData["startup"];


  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div ref={containerRef} className={`bg-black text-white min-h-screen overflow-x-hidden ${robotoMono.className}`}>
      
      {/* 3D Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <Environment preset="city">
            <Lightformer intensity={4} position={[10, 5, 0]} scale={[10, 50, 1]} onUpdate={(self) => self.lookAt(0, 0, 0)} />
          </Environment>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <AbstractShape />
          <Sparkles count={100} scale={10} size={2} speed={0.4} opacity={0.2} color="#ffffff" />
        </Canvas>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full p-6 md:p-10 z-50 flex justify-between items-center mix-blend-difference">
        <Link href="/" className="text-xs tracking-[0.3em] uppercase hover:opacity-50 transition-opacity">
          ← Back
        </Link>
        <div className="text-xs tracking-[0.3em] uppercase text-white/50">
          Case Study
        </div>
      </nav>

      {/* Content wrapper */}
      <main className="relative z-10 w-full">
        
        {/* HERO SECTION */}
        <section className="h-screen flex flex-col justify-center items-start px-6 md:px-[10vw]">
          <motion.div
            style={{ y: yHero, opacity: opacityHero }}
            className="w-full max-w-5xl shrink-0"
          >
            <motion.div
               animate={{ opacity: [0, 1] }}
               transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
               className="mb-8 overflow-hidden"
            >
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10vw] font-light uppercase tracking-tighter leading-[0.9]">
                {data.title}
              </h1>
            </motion.div>
            
            <motion.div
               animate={{ opacity: [0, 1], y: [20, 0] }}
               transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
               className="w-full h-[1px] bg-white/20 mb-8"
            />
            
            <motion.p
              animate={{ opacity: [0, 1] }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.7 }}
              className="text-sm md:text-xl text-gray-400 font-light tracking-widest uppercase max-w-2xl"
            >
              {data.subtitle}
            </motion.p>
          </motion.div>
        </section>

        {/* DETAILS SECTION */}
        <section className="py-24 px-6 md:px-[10vw] border-t border-white/5 bg-black/80 backdrop-blur-md">
          <div className="flex flex-col md:flex-row gap-16 md:gap-[10vw]">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="flex-1"
            >
              <h3 className="text-xs uppercase tracking-[0.5em] text-white/50 mb-8">01 / Overview</h3>
              <p className="text-lg md:text-2xl font-light leading-relaxed text-gray-300">
                {data.description}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-1 md:max-w-xs"
            >
              <h3 className="text-xs uppercase tracking-[0.5em] text-white/50 mb-8">02 / Tech Stack</h3>
              <div className="flex flex-col gap-8">
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-neutral-600">Backend</p>
                  <p className="text-sm font-light tracking-wider text-neutral-300">{data.tech.backend}</p>
                </div>
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-neutral-600">Frontend</p>
                  <p className="text-sm font-light tracking-wider text-neutral-300">{data.tech.frontend}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* IMAGES GALLERY */}
        <section className="py-24 px-6 md:px-[10vw] flex flex-col gap-16 md:gap-32 bg-black/90">
          {data.images.map((src, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
              whileInView={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-[50vh] md:h-[80vh] relative rounded-2xl overflow-hidden border border-white/10"
            >
              <img
                src={src}
                alt={`${data.title} Image ${idx + 1}`}
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent mix-blend-multiply" />
            </motion.div>
          ))}
        </section>

        {/* NEXT PROJECT / FOOTER */}
        <section className="py-40 flex justify-center text-center px-6">
          <Link href="/">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group cursor-pointer"
            >
              <h2 className="text-3xl md:text-6xl font-extralight uppercase tracking-widest text-white/50 transition-colors duration-500 group-hover:text-white">
                Back to Projects
              </h2>
              <div className="mt-8 mx-auto w-0 h-[1px] bg-white transition-all duration-500 group-hover:w-32" />
            </motion.div>
          </Link>
        </section>

      </main>
    </div>
  );
}
