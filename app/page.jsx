"use client";

import { useEffect, useRef, useCallback } from "react";
import { Roboto_Mono } from "next/font/google";
// FIXED: Added useInView here
import { motion, useScroll, useTransform, useMotionValueEvent, useInView } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollStack, { ScrollStackItem } from '../components/ScrollStack';
import dynamic from "next/dynamic";

// LAZY LOAD THE 3D SCENE
const DynamicPhysics = dynamic(() => import('../components/PhysicsScene'), {
  ssr: false, 
});

const robotoMono = Roboto_Mono({ 
  subsets: ["latin"], 
  weight: ["300", "400", "700"] 
});

const bioContent = [
  { l: "I AM A", r: "PASSIONATE" },
  { l: "DIGITAL", r: "CREATOR" },
  { l: "AND PRODUCT", r: "DESIGNER" },
  { l: "BASED IN", r: "NEW YORK." },
  { l: "WITH OVER", r: "A DECADE" },
  { l: "OF EXPERIENCE", r: "IN CRAFTING" },
  { l: "IMMERSIVE", r: "WEB" },
  { l: "EXPERIENCES,", r: "I SPECIALIZE" },
  { l: "IN BRIDGING", r: "THE GAP" },
  { l: "BETWEEN", r: "ELEGANT" },
  { l: "AESTHETICS", r: "AND COMPLEX" },
  { l: "TECHNICAL", r: "SOLUTIONS." },
  { l: "MY WORK", r: "FOCUSES ON" },
  { l: "USER-CENTRIC", r: "DESIGN," },
  { l: "INTERACTIVE", r: "APPLICATIONS," },
  { l: "AND BRAND", r: "IDENTITY." },
  { l: "I BELIEVE", r: "IN PUSHING" },
  { l: "THE BOUNDARIES", r: "OF WHAT" },
  { l: "IS POSSIBLE", r: "ON THE WEB," },
  { l: "UTILIZING", r: "CUTTING-EDGE" },
  { l: "TECHNOLOGIES", r: "TO BUILD" },
  { l: "SCALABLE,", r: "INTUITIVE," },
  { l: "AND MEMORABLE", r: "PRODUCTS." },
  { l: "FROM EARLY", r: "CONCEPTS" },
  { l: "TO FINAL", r: "PIXEL-PERFECT" },
  { l: "EXECUTION,", r: "I DEDICATE" },
  { l: "MYSELF TO", r: "TRANSFORMING" },
  { l: "VISIONARY", r: "IDEAS" },
  { l: "INTO TANGIBLE", r: "REALITIES" },
  { l: "THAT RESONATE", r: "WITH USERS" },
  { l: "WORLDWIDE.", r: "LET'S TALK." },
  { l: "EXPERIENCES,", r: "I SPECIALIZE" },
  { l: "IN BRIDGING", r: "THE GAP" },
  { l: "BETWEEN", r: "ELEGANT" },
  { l: "AESTHETICS", r: "AND COMPLEX" },
  { l: "TECHNICAL", r: "SOLUTIONS." },
  { l: "MY WORK", r: "FOCUSES ON" },
  { l: "USER-CENTRIC", r: "DESIGN," },
  { l: "INTERACTIVE", r: "APPLICATIONS," },
  { l: "AND BRAND", r: "IDENTITY." },
  { l: "I BELIEVE", r: "IN PUSHING" },
  { l: "THE BOUNDARIES", r: "OF WHAT" },
  { l: "IS POSSIBLE", r: "ON THE WEB," },
  { l: "UTILIZING", r: "CUTTING-EDGE" },
  { l: "TECHNOLOGIES", r: "TO BUILD" },
  { l: "SCALABLE,", r: "INTUITIVE," },
  { l: "AND MEMORABLE", r: "PRODUCTS." },
  { l: "FROM EARLY", r: "CONCEPTS" },
  { l: "TO FINAL", r: "PIXEL-PERFECT" },
  { l: "EXECUTION,", r: "I DEDICATE" },
  { l: "MYSELF TO", r: "TRANSFORMING" },
  { l: "VISIONARY", r: "IDEAS" },
  { l: "INTO TANGIBLE", r: "REALITIES" },
  { l: "THAT RESONATE", r: "WITH USERS" },
  { l: "WORLDWIDE.", r: "LET'S TALK." },
];

export default function Home() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const waveWrapperRef = useRef(null); 
  
  // FIXED: Added a ref for the 3D section to track when it enters the screen
  const physicsContainerRef = useRef(null);
  const isPhysicsInView = useInView(physicsContainerRef, { once: true, margin: "200px" });

  const imagesRef = useRef([]);
  const totalFrames = 192; 

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const drawImage = useCallback((img) => {
    const canvas = canvasRef.current;
    if (!canvas || !img || typeof window === "undefined") return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ratio = Math.max(canvas.width / img.width, canvas.height / img.height);
    const newWidth = img.width * ratio;
    const newHeight = img.height * ratio;
    const offsetX = (canvas.width - newWidth) / 2;
    const offsetY = (canvas.height - newHeight) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);
  }, []);

  // FIXED: Staggered Image Loading to prevent browser freezing
  useEffect(() => {
    const loadedImages = new Array(totalFrames).fill(null);
    imagesRef.current = loadedImages;

    const loadFrame = (index) => {
      const img = new Image();
      const frameNumber = index.toString().padStart(5, "0");
      img.src = `/frames/${frameNumber}_compressed.webp`;
      if (index === 1) {
        img.onload = () => drawImage(img);
      }
      loadedImages[index - 1] = img;
    };

    // Instantly load first 10 frames
    for (let i = 1; i <= 10; i++) {
      loadFrame(i);
    }

    // Load the rest in the background after 1 second
    const timeoutId = setTimeout(() => {
      for (let i = 11; i <= totalFrames; i++) {
        setTimeout(() => loadFrame(i), i * 5);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [drawImage]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    let currentFrameIndex = 0;
    if (progress < 0.33) {
      const segmentProgress = progress / 0.33;
      currentFrameIndex = Math.floor(segmentProgress * 79);
    } else if (progress < 0.66) {
      const segmentProgress = (progress - 0.33) / 0.33;
      currentFrameIndex = 79 + Math.floor(segmentProgress * 80);
    } else {
      const segmentProgress = (progress - 0.66) / 0.34;
      currentFrameIndex = 159 + Math.floor(segmentProgress * 32);
    }
    currentFrameIndex = Math.min(totalFrames - 1, Math.max(0, currentFrameIndex));
    
    // Safely check if the image has actually loaded yet before drawing
    const img = imagesRef.current[currentFrameIndex];
    if (img && img.complete) drawImage(img);
  });

  useEffect(() => {
    const handleResize = () => {
      const progress = scrollYProgress.get();
      let currentIndex = Math.floor(progress * (totalFrames - 1));
      const img = imagesRef.current[currentIndex];
      if (img && img.complete) drawImage(img);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawImage, scrollYProgress]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const wrapper = waveWrapperRef.current;
    if (!wrapper) return;

    let ctx = gsap.context(() => {
      const leftColumn = wrapper.querySelector(".wave-column-left");
      const rightColumn = wrapper.querySelector(".wave-column-right");
      const leftTexts = gsap.utils.toArray(leftColumn.querySelectorAll(".animated-text"));
      const rightTexts = gsap.utils.toArray(rightColumn.querySelectorAll(".animated-text"));

      if (!leftTexts.length || !rightTexts.length) return;

      const wavePhaseStep = 0.5; 
      const waveSpeed = 0.8; 
      const waveAmplitude = 0.5; 

      const leftQuickSetters = leftTexts.map(text => gsap.quickTo(text, "x", { duration: 0.6, ease: "power4.out" }));
      const rightQuickSetters = rightTexts.map(text => gsap.quickTo(text, "x", { duration: 0.6, ease: "power4.out" }));

      let leftRange = { minX: 0, maxX: 0 };
      let rightRange = { minX: 0, maxX: 0 };

      const calculateRanges = () => {
        const maxLeftTextWidth = Math.max(...leftTexts.map((t) => t.offsetWidth));
        const maxRightTextWidth = Math.max(...rightTexts.map((t) => t.offsetWidth));
        
        leftRange.maxX = Math.max(0, leftColumn.offsetWidth - maxLeftTextWidth) * waveAmplitude;
        rightRange.maxX = Math.max(0, rightColumn.offsetWidth - maxRightTextWidth) * waveAmplitude;
      };

      calculateRanges();
      window.addEventListener("resize", calculateRanges);

      const setInitialPositions = (texts, range, multiplier) => {
        texts.forEach((text, index) => {
          const initialPhase = wavePhaseStep * index - Math.PI / 2;
          const initialWave = Math.sin(initialPhase);
          const initialProgress = (initialWave + 1) / 2;
          const startX = (range.minX + initialProgress * range.maxX) * multiplier;
          gsap.set(text, { x: startX });
        });
      };

      setInitialPositions(leftTexts, leftRange, 1);
      setInitialPositions(rightTexts, rightRange, -1);

      ScrollTrigger.create({
        trigger: wrapper, 
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const globalProgress = self.progress;
          const viewportCenter = window.innerHeight / 2;
          let closestIndex = 0;
          let minDistance = Infinity;

          leftTexts.forEach((text, index) => {
            const rect = text.getBoundingClientRect();
            const elementCenter = rect.top + rect.height / 2;
            const distance = Math.abs(elementCenter - viewportCenter);

            if (distance < minDistance) {
              minDistance = distance;
              closestIndex = index;
            }
          });

          const updateColumn = (texts, setters, range, multiplier) => {
            texts.forEach((text, index) => {
              const phase = wavePhaseStep * index + waveSpeed * globalProgress * Math.PI * 2 - Math.PI / 2;
              const wave = Math.sin(phase);
              const cycleProgress = (wave + 1) / 2;
              const finalX = (range.minX + cycleProgress * range.maxX) * multiplier;

              setters[index](finalX);

              if (index === closestIndex) {
                if (text.dataset.focused !== "true") {
                  text.dataset.focused = "true";
                  gsap.to(text, { 
                    scale: 1.05, 
                    color: "white", 
                    opacity: 1, 
                    textShadow: "0 0 20px rgba(255,255,255,0.4)", 
                    duration: 0.2, 
                    overwrite: "auto" 
                  });
                }
              } else {
                if (text.dataset.focused !== "false") {
                  text.dataset.focused = "false";
                  gsap.to(text, { 
                    scale: 1, 
                    color: "#4d4d4d", 
                    opacity: 0.4, 
                    textShadow: "none", 
                    duration: 0.2, 
                    overwrite: "auto" 
                  });
                }
              }
            });
          };

          updateColumn(leftTexts, leftQuickSetters, leftRange, 1);
          updateColumn(rightTexts, rightQuickSetters, rightRange, -1);
        }
      });

      return () => window.removeEventListener("resize", calculateRanges);
    }, wrapper);

    return () => ctx.revert();
  }, []);

  const landingOpacity = useTransform(scrollYProgress, [0, 0.08, 1], [1, 0, 0]);
  const glassOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [0, 0, 1]);

  return (
    <div className={`bg-black min-h-screen ${robotoMono.className}`}>
      
      <div className="fixed top-0 left-0 w-full h-screen overflow-hidden z-0 pointer-events-none">
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full object-cover z-0" />
        
        <div className="absolute top-0 left-0 w-full h-full z-10 text-white">
          <motion.div style={{ opacity: landingOpacity }} className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center">
            <h1 className="text-5xl md:text-7xl font-light tracking-widest uppercase">Muhammad Abubakar</h1>
            <p className="mt-4 text-sm tracking-[0.3em] text-gray-400">Software Engineer</p>
          </motion.div>
        </div>

        <motion.div 
          style={{ opacity: glassOpacity }} 
          className="absolute inset-0 z-20 bg-white/[0.12] backdrop-blur-[24px] border-t border-white/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]" 
        />
      </div>

      <main ref={containerRef} className="relative w-full z-10 flex flex-col justify-center overflow-hidden pt-[200vh] pb-[10vh]">
        <div className="sticky top-20 w-full text-center text-white/50 tracking-[0.5em] text-sm font-light z-[200] pointer-events-none mb-10">
          01 / BIO
        </div>

        <div ref={waveWrapperRef} className="dual-wave-wrapper flex w-full relative gap-[10vw] px-[10vw]">
          <div className="wave-column wave-column-left flex-1 flex flex-col items-start gap-[1vh] text-[clamp(1.2rem,2.5vw,2rem)] font-light leading-none relative z-[100]">
            {bioContent.map((line, i) => (
              <div key={`l-${i}`} className="animated-text w-max origin-left uppercase text-[#4d4d4d] opacity-40">
                {line.l}
              </div>
            ))}
          </div>
          <div className="wave-column wave-column-right flex-1 flex flex-col items-end text-right gap-[1vh] text-[clamp(1.2rem,2.5vw,2rem)] font-light leading-none relative z-[100]">
            {bioContent.map((line, i) => (
              <div key={`r-${i}`} className="animated-text w-max origin-right uppercase text-[#4d4d4d] opacity-40">
                {line.r}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FIXED: Attached ref here. The 3D engine only turns on when you scroll to it! */}
      <div ref={physicsContainerRef} className="relative w-full h-200 pt-50 bg-black [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_200px)] [mask-image:linear-gradient(to_bottom,transparent,black_200px)] z-40">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 text-white/50 tracking-[0.5em] text-sm font-light z-50 pointer-events-none">
          02 / TECH STACK
        </div>
        {isPhysicsInView && <DynamicPhysics />}
      </div>

      <section className="relative w-full bg-black text-white z-30 pt-15 pb-32">
        <div className="text-center mb-16 text-white/50 tracking-[0.5em] text-sm font-light">
          03 / PROJECTS
        </div>
        
        <div className="max-w-5xl mx-auto px-4">
          <ScrollStack useWindowScroll={true}>
            
            <ScrollStackItem>
              <div className="bg-[#111111] border border-white/10 rounded-2xl h-[50vh] flex overflow-hidden">
                <div className="flex-1 p-10 flex flex-col justify-center">
                  <h2 className="text-4xl md:text-5xl font-light mb-2 tracking-widest uppercase">SIVO</h2>
                  <p className="text-neutral-400 mb-8 tracking-wider font-light">Sign to speech & speech to sign</p>
                  <div className="mt-auto flex flex-col gap-4">
                    <div>
                      <p className="text-xs text-neutral-600 mb-1 uppercase tracking-[0.2em]">Backend</p>
                      <p className="text-sm text-neutral-300 font-light tracking-wider">Python, Flask, TensorFlow</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 mb-1 uppercase tracking-[0.2em]">Frontend</p>
                      <p className="text-sm text-neutral-300 font-light tracking-wider">React-Native</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 relative hidden md:block border-l border-white/10">
                  <img src="https://picsum.photos/seed/sivo/800/800" alt="SIVO" className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700" />
                </div>
              </div>
            </ScrollStackItem>

            <ScrollStackItem>
              <div className="bg-[#111111] border border-white/10 rounded-2xl h-[50vh] flex overflow-hidden">
                <div className="flex-1 p-10 flex flex-col justify-center">
                  <h2 className="text-4xl md:text-5xl font-light mb-2 tracking-widest uppercase">Agrimind</h2>
                  <p className="text-neutral-400 mb-8 tracking-wider font-light">AI farmers resource allocation system</p>
                  <div className="mt-auto flex flex-col gap-4">
                    <div>
                      <p className="text-xs text-neutral-600 mb-1 uppercase tracking-[0.2em]">Backend</p>
                      <p className="text-sm text-neutral-300 font-light tracking-wider leading-relaxed">Python (AI agents), Langgraph, Node.js, MongoDB</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 mb-1 uppercase tracking-[0.2em]">Frontend</p>
                      <p className="text-sm text-neutral-300 font-light tracking-wider">Next.js, Tailwind</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 relative hidden md:block border-l border-white/10">
                  <img src="https://picsum.photos/seed/agrimind/800/800" alt="Agrimind" className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700" />
                </div>
              </div>
            </ScrollStackItem>

            <ScrollStackItem>
              <div className="bg-[#111111] border border-white/10 rounded-2xl h-[50vh] flex overflow-hidden">
                <div className="flex-1 p-10 flex flex-col justify-center">
                  <h2 className="text-4xl md:text-4xl font-light mb-2 tracking-widest uppercase">Semi-Quant Auto</h2>
                  <p className="text-neutral-400 mb-8 tracking-wider font-light">Future market strategy Automation</p>
                  <div className="mt-auto flex flex-col gap-4">
                    <div>
                      <p className="text-xs text-neutral-600 mb-1 uppercase tracking-[0.2em]">Backend</p>
                      <p className="text-sm text-neutral-300 font-light tracking-wider">Python</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 mb-1 uppercase tracking-[0.2em]">Frontend</p>
                      <p className="text-sm text-neutral-300 font-light tracking-wider">Python</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 relative hidden md:block border-l border-white/10">
                  <img src="https://picsum.photos/seed/quant/800/800" alt="Quant" className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700" />
                </div>
              </div>
            </ScrollStackItem>

            <ScrollStackItem>
              <div className="bg-[#111111] border border-white/10 rounded-2xl h-[50vh] flex overflow-hidden">
                <div className="flex-1 p-10 flex flex-col justify-center">
                  <h2 className="text-4xl md:text-5xl font-light mb-2 tracking-widest uppercase">Startup Analyser</h2>
                  <p className="text-neutral-400 mb-8 tracking-wider font-light">AI startup analyser using RAG system</p>
                  <div className="mt-auto flex flex-col gap-4">
                    <div>
                      <p className="text-xs text-neutral-600 mb-1 uppercase tracking-[0.2em]">Backend</p>
                      <p className="text-sm text-neutral-300 font-light tracking-wider leading-relaxed">Python, Node.js, Express, MongoDB, Redis</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 mb-1 uppercase tracking-[0.2em]">Frontend</p>
                      <p className="text-sm text-neutral-300 font-light tracking-wider">React.js</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 relative hidden md:block border-l border-white/10">
                  <img src="https://picsum.photos/seed/startup/800/800" alt="Startup" className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700" />
                </div>
              </div>
            </ScrollStackItem>

            <ScrollStackItem>
              <div className="bg-[#111111] border border-white/10 rounded-2xl h-[50vh] flex overflow-hidden">
                <div className="flex-1 p-10 flex flex-col justify-center">
                  <h2 className="text-4xl md:text-5xl font-light mb-2 tracking-widest uppercase">ArMall.pk</h2>
                  <p className="text-neutral-400 mb-8 tracking-wider font-light">Ecommerce website design</p>
                  <div className="mt-auto flex flex-col gap-4">
                    <div>
                      <p className="text-xs text-neutral-600 mb-1 uppercase tracking-[0.2em]">Backend</p>
                      <p className="text-sm text-neutral-300 font-light tracking-wider leading-relaxed">Next.js, Mongoose, Clerk, MongoDB</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 mb-1 uppercase tracking-[0.2em]">Frontend</p>
                      <p className="text-sm text-neutral-300 font-light tracking-wider">Next.js, Tailwind</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 relative hidden md:block border-l border-white/10">
                  <img src="https://picsum.photos/seed/armall/800/800" alt="ArMall" className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700" />
                </div>
              </div>
            </ScrollStackItem>

          </ScrollStack>
        </div>
      </section>

      <section className="relative w-full min-h-[60vh] bg-black text-white z-50 flex flex-col items-center justify-center border-t border-white/5 pb-20 pt-10">
        <div className="text-center mb-16 text-white/50 tracking-[0.5em] text-sm font-light">
          04 / CONTACT
        </div>
        <h2 className="text-5xl md:text-8xl font-extralight uppercase tracking-widest text-white/90 hover:text-white transition-colors cursor-pointer text-center px-4">
          Let's Talk.
        </h2>
        <a href="mailto:hello@example.com" className="mt-8 text-neutral-500 hover:text-white transition-colors font-light tracking-widest text-sm uppercase">
          hello@yourdomain.com
        </a>
        <div className="flex gap-10 mt-16 text-xs md:text-sm tracking-widest text-neutral-600 uppercase">
          <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
        </div>
      </section>

    </div>
  );
}