"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Roboto_Mono } from "next/font/google";
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollStack, { ScrollStackItem } from "../components/ScrollStack";
import dynamic from "next/dynamic";
import { FRAME_COUNT, PHYSICS_ENVIRONMENT, PHYSICS_TEXTURES, getFrameSrc } from "../lib/homePreload";

const DynamicPhysics = dynamic(() => import("../components/PhysicsScene"), {
  ssr: false,
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
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
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isImagesLoaded, setIsImagesLoaded] = useState(false);
  const [isPhysicsLoaded, setIsPhysicsLoaded] = useState(false);
  const [isWindowLoaded, setIsWindowLoaded] = useState(false);
  const [shouldRenderPhysics, setShouldRenderPhysics] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const waveWrapperRef = useRef(null);
  const physicsContainerRef = useRef(null);
  const imagesRef = useRef([]);

  const preloadImage = useCallback((src) => {
    if (typeof window === "undefined") {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      const img = new window.Image();
      img.decoding = "async";

      const finish = () => resolve(img);

      img.onload = () => {
        if (typeof img.decode === "function") {
          img.decode().catch(() => {}).finally(finish);
          return;
        }

        finish();
      };

      img.onerror = () => resolve(null);
      img.src = src;
    });
  }, []);

  const preloadFile = useCallback(async (src) => {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      const response = await fetch(src, { cache: "force-cache" });
      if (!response.ok) {
        return false;
      }

      await response.blob();
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isLoading]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
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

  useEffect(() => {
    if (isImagesLoaded && isPhysicsLoaded && isWindowLoaded) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        window.scrollTo(0, 0);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isImagesLoaded, isPhysicsLoaded, isWindowLoaded]);

  useEffect(() => {
    let cleanupLoadListener = null;

    if (document.readyState === "complete") {
      setIsWindowLoaded(true);
    } else {
      const handleLoad = () => setIsWindowLoaded(true);
      window.addEventListener("load", handleLoad, { once: true });
      cleanupLoadListener = () => window.removeEventListener("load", handleLoad);
    }

    const fallbackInfo = setTimeout(() => {
      setIsLoading(false);
    }, 15000);

    return () => {
      cleanupLoadListener?.();
      clearTimeout(fallbackInfo);
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;
    let physicsFallbackTimer = null;

    const preloadPhysicsScene = async () => {
      try {
        await import("../components/PhysicsScene");
        await Promise.all([
          ...PHYSICS_TEXTURES.map((src) => preloadImage(src)),
          preloadFile(PHYSICS_ENVIRONMENT),
        ]);
      } finally {
        if (isCancelled) {
          return;
        }

        setShouldRenderPhysics(true);
        physicsFallbackTimer = window.setTimeout(() => {
          setIsPhysicsLoaded(true);
        }, 2500);
      }
    };

    preloadPhysicsScene().catch(() => {
      if (!isCancelled) {
        setShouldRenderPhysics(true);
        setIsPhysicsLoaded(true);
      }
    });

    return () => {
      isCancelled = true;
      if (physicsFallbackTimer) {
        window.clearTimeout(physicsFallbackTimer);
      }
    };
  }, [preloadFile, preloadImage]);

  useEffect(() => {
    let isCancelled = false;
    const loadedImages = new Array(FRAME_COUNT).fill(null);
    imagesRef.current = loadedImages;

    const loadFrame = async (index) => {
      const img = await preloadImage(getFrameSrc(index));

      if (isCancelled) {
        return null;
      }

      loadedImages[index - 1] = img;
      return img;
    };

    const preloadFrames = async () => {
      const firstFrame = await loadFrame(1);
      if (firstFrame) {
        drawImage(firstFrame);
      }

      let nextFrameIndex = 2;
      const workers = Array.from({ length: 10 }, async () => {
        while (!isCancelled && nextFrameIndex <= FRAME_COUNT) {
          const frameIndex = nextFrameIndex;
          nextFrameIndex += 1;
          await loadFrame(frameIndex);
        }
      });

      await Promise.all(workers);

      if (!isCancelled) {
        setIsImagesLoaded(true);
      }
    };

    preloadFrames().catch(() => {
      if (!isCancelled) {
        setIsImagesLoaded(true);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [drawImage, preloadImage]);

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

    currentFrameIndex = Math.min(FRAME_COUNT - 1, Math.max(0, currentFrameIndex));

    const img = imagesRef.current[currentFrameIndex];
    if (img && img.complete) drawImage(img);
  });

  useEffect(() => {
    const handleResize = () => {
      const progress = scrollYProgress.get();
      const currentIndex = Math.floor(progress * (FRAME_COUNT - 1));
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

    const ctx = gsap.context(() => {
      const leftColumn = wrapper.querySelector(".wave-column-left");
      const rightColumn = wrapper.querySelector(".wave-column-right");
      const leftTexts = gsap.utils.toArray(leftColumn.querySelectorAll(".animated-text"));
      const rightTexts = gsap.utils.toArray(rightColumn.querySelectorAll(".animated-text"));

      if (!leftTexts.length || !rightTexts.length) return;

      const wavePhaseStep = 0.5;
      const waveSpeed = 0.8;
      const waveAmplitude = 0.5;

      const leftQuickSetters = leftTexts.map((text) => gsap.quickTo(text, "x", { duration: 0.6, ease: "power4.out" }));
      const rightQuickSetters = rightTexts.map((text) => gsap.quickTo(text, "x", { duration: 0.6, ease: "power4.out" }));

      const leftRange = { minX: 0, maxX: 0 };
      const rightRange = { minX: 0, maxX: 0 };

      const calculateRanges = () => {
        const maxLeftTextWidth = Math.max(...leftTexts.map((text) => text.offsetWidth));
        const maxRightTextWidth = Math.max(...rightTexts.map((text) => text.offsetWidth));

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
                    overwrite: "auto",
                  });
                }
              } else if (text.dataset.focused !== "false") {
                text.dataset.focused = "false";
                gsap.to(text, {
                  scale: 1,
                  color: "#4d4d4d",
                  opacity: 0.4,
                  textShadow: "none",
                  duration: 0.2,
                  overwrite: "auto",
                });
              }
            });
          };

          updateColumn(leftTexts, leftQuickSetters, leftRange, 1);
          updateColumn(rightTexts, rightQuickSetters, rightRange, -1);
        },
      });

      return () => window.removeEventListener("resize", calculateRanges);
    }, wrapper);

    return () => ctx.revert();
  }, []);

  const landingOpacity = useTransform(scrollYProgress, [0, 0.08, 1], [1, 0, 0]);
  const glassOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [0, 0, 1]);

  return (
    <div className={`bg-black min-h-screen ${robotoMono.className} overflow-x-hidden`}>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#050505]"
          >
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute h-40 w-40 rounded-full border-[1px] border-white/10 border-t-white/80 md:h-56 md:w-56"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute h-32 w-32 rounded-full border-[1px] border-white/5 border-b-white/30 border-r-white/30 md:h-48 md:w-48"
              />
              <motion.div
                animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute h-2 w-2 rounded-full bg-white md:h-3 md:w-3"
              />
            </div>
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mt-12 text-xs font-light uppercase tracking-[0.5em] text-white/60 md:text-sm"
            >
              Loading
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed left-0 top-0 z-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="absolute left-0 top-0 z-0 h-full w-full object-cover" />

        <div className="absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-end px-4 pb-24 text-white md:pb-32">
          <motion.div style={{ opacity: landingOpacity }} className="text-center">
            <h1 className="text-4xl font-light uppercase tracking-widest md:text-7xl">Muhammad Abubakar</h1>
            <p className="mt-4 text-xs tracking-[0.3em] text-gray-400 md:text-sm">Software Engineer</p>
          </motion.div>
        </div>

        <motion.div
          style={{ opacity: glassOpacity }}
          className="absolute inset-0 z-20 border-t border-white/20 bg-white/[0.12] shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] backdrop-blur-[24px]"
        />
      </div>

      <main ref={containerRef} className="relative z-10 flex w-full flex-col justify-center overflow-hidden pt-[200vh] pb-[10vh]">
        <div className="pointer-events-none mb-10 sticky top-20 z-[200] w-full text-center text-xs font-light tracking-[0.5em] text-white/50 md:text-sm">
          01 / BIO
        </div>

        <div ref={waveWrapperRef} className="dual-wave-wrapper relative flex w-full gap-4 px-4 md:gap-[10vw] md:px-[10vw]">
          <div className="wave-column wave-column-left relative z-[100] flex flex-1 flex-col items-start gap-[1vh] text-[clamp(0.75rem,3vw,2rem)] font-light leading-none">
            {bioContent.map((line, i) => (
              <div key={`l-${i}`} className="animated-text w-max origin-left uppercase text-[#4d4d4d] opacity-40">
                {line.l}
              </div>
            ))}
          </div>
          <div className="wave-column wave-column-right relative z-[100] flex flex-1 flex-col items-end gap-[1vh] text-right text-[clamp(0.75rem,3vw,2rem)] font-light leading-none">
            {bioContent.map((line, i) => (
              <div key={`r-${i}`} className="animated-text w-max origin-right uppercase text-[#4d4d4d] opacity-40">
                {line.r}
              </div>
            ))}
          </div>
        </div>
      </main>

      <div ref={physicsContainerRef} className="relative z-40 h-[70vh] w-full bg-black [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_200px)] [mask-image:linear-gradient(to_bottom,transparent,black_200px)] md:h-screen">
        <div className="pointer-events-none absolute left-1/2 top-10 z-50 w-full -translate-x-1/2 text-center text-xs font-light tracking-[0.5em] text-white/50 md:top-20 md:text-sm">
          02 / TECH STACK
        </div>
        {shouldRenderPhysics ? <DynamicPhysics onLoaded={() => setIsPhysicsLoaded(true)} /> : null}
      </div>

      <section className="relative z-30 flex w-full flex-col items-center bg-black pt-10 pb-32 text-white md:pt-15">
        <div className="mb-10 w-full text-center text-xs font-light tracking-[0.5em] text-white/50 md:mb-16 md:text-sm">
          03 / PROJECTS
        </div>

        <div className="flex w-full justify-center">
          <ScrollStack useWindowScroll={true}>
            <ScrollStackItem>
              <div className="mx-auto flex min-h-[50vh] w-[92vw] max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111] md:h-[65vh] md:w-[80vw] md:flex-row">
                <div className="relative h-40 w-full shrink-0 border-b border-white/10 md:hidden">
                  <img src="https://picsum.photos/seed/sivo/800/800" alt="SIVO" className="h-full w-full object-cover opacity-60 grayscale" />
                </div>
                <div className="flex flex-1 flex-col justify-center p-6 md:p-12">
                  <h2 className="mb-2 text-3xl font-light uppercase tracking-widest md:mb-4 md:text-6xl">SIVO</h2>
                  <p className="mb-6 text-sm font-light tracking-wider text-neutral-400 md:mb-10 md:text-lg">Sign to speech & speech to sign</p>
                  <div className="mt-auto flex flex-col gap-3 md:gap-6">
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-neutral-600 md:mb-2 md:text-sm">Backend</p>
                      <p className="text-xs font-light tracking-wider text-neutral-300 md:text-base">Python, Flask, TensorFlow</p>
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-neutral-600 md:mb-2 md:text-sm">Frontend</p>
                      <p className="text-xs font-light tracking-wider text-neutral-300 md:text-base">React-Native</p>
                    </div>
                  </div>
                </div>
                <div className="relative hidden flex-1 border-l border-white/10 md:block">
                  <img src="https://picsum.photos/seed/sivo/800/800" alt="SIVO" className="h-full w-full object-cover opacity-50 grayscale transition-all duration-700 hover:opacity-100 hover:grayscale-0" />
                </div>
              </div>
            </ScrollStackItem>

            <ScrollStackItem>
              <div className="mx-auto flex min-h-[50vh] w-[92vw] max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111] md:h-[65vh] md:w-[80vw] md:flex-row">
                <div className="relative h-40 w-full shrink-0 border-b border-white/10 md:hidden">
                  <img src="https://picsum.photos/seed/agrimind/800/800" alt="Agrimind" className="h-full w-full object-cover opacity-60 grayscale" />
                </div>
                <div className="flex flex-1 flex-col justify-center p-6 md:p-12">
                  <h2 className="mb-2 text-3xl font-light uppercase tracking-widest md:mb-4 md:text-6xl">Agrimind</h2>
                  <p className="mb-6 text-sm font-light tracking-wider text-neutral-400 md:mb-10 md:text-lg">AI farmers resource allocation</p>
                  <div className="mt-auto flex flex-col gap-3 md:gap-6">
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-neutral-600 md:mb-2 md:text-sm">Backend</p>
                      <p className="text-xs font-light leading-relaxed tracking-wider text-neutral-300 md:text-base">Python (AI agents), Langgraph, Node.js, MongoDB</p>
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-neutral-600 md:mb-2 md:text-sm">Frontend</p>
                      <p className="text-xs font-light tracking-wider text-neutral-300 md:text-base">Next.js, Tailwind</p>
                    </div>
                  </div>
                </div>
                <div className="relative hidden flex-1 border-l border-white/10 md:block">
                  <img src="https://picsum.photos/seed/agrimind/800/800" alt="Agrimind" className="h-full w-full object-cover opacity-50 grayscale transition-all duration-700 hover:opacity-100 hover:grayscale-0" />
                </div>
              </div>
            </ScrollStackItem>

            <ScrollStackItem>
              <div className="mx-auto flex min-h-[50vh] w-[92vw] max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111] md:h-[65vh] md:w-[80vw] md:flex-row">
                <div className="relative h-40 w-full shrink-0 border-b border-white/10 md:hidden">
                  <img src="https://picsum.photos/seed/quant/800/800" alt="Semi-Quant" className="h-full w-full object-cover opacity-60 grayscale" />
                </div>
                <div className="flex flex-1 flex-col justify-center p-6 md:p-12">
                  <h2 className="mb-2 text-3xl font-light uppercase tracking-widest md:mb-4 md:text-5xl">Semi-Quant Auto</h2>
                  <p className="mb-6 text-sm font-light tracking-wider text-neutral-400 md:mb-10 md:text-lg">Future market strategy Automation</p>
                  <div className="mt-auto flex flex-col gap-3 md:gap-6">
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-neutral-600 md:mb-2 md:text-sm">Backend</p>
                      <p className="text-xs font-light tracking-wider text-neutral-300 md:text-base">Python</p>
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-neutral-600 md:mb-2 md:text-sm">Frontend</p>
                      <p className="text-xs font-light tracking-wider text-neutral-300 md:text-base">Python</p>
                    </div>
                  </div>
                </div>
                <div className="relative hidden flex-1 border-l border-white/10 md:block">
                  <img src="https://picsum.photos/seed/quant/800/800" alt="Quant" className="h-full w-full object-cover opacity-50 grayscale transition-all duration-700 hover:opacity-100 hover:grayscale-0" />
                </div>
              </div>
            </ScrollStackItem>

            <ScrollStackItem>
              <div className="mx-auto flex min-h-[50vh] w-[92vw] max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111] md:h-[65vh] md:w-[80vw] md:flex-row">
                <div className="relative h-40 w-full shrink-0 border-b border-white/10 md:hidden">
                  <img src="https://picsum.photos/seed/startup/800/800" alt="Startup" className="h-full w-full object-cover opacity-60 grayscale" />
                </div>
                <div className="flex flex-1 flex-col justify-center p-6 md:p-12">
                  <h2 className="mb-2 text-3xl font-light uppercase tracking-widest md:mb-4 md:text-5xl">Startup Analyser</h2>
                  <p className="mb-6 text-sm font-light tracking-wider text-neutral-400 md:mb-10 md:text-lg">AI startup analyser using RAG system</p>
                  <div className="mt-auto flex flex-col gap-3 md:gap-6">
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-neutral-600 md:mb-2 md:text-sm">Backend</p>
                      <p className="text-xs font-light leading-relaxed tracking-wider text-neutral-300 md:text-base">Python, Node.js, Express, MongoDB, Redis</p>
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-neutral-600 md:mb-2 md:text-sm">Frontend</p>
                      <p className="text-xs font-light tracking-wider text-neutral-300 md:text-base">React.js</p>
                    </div>
                  </div>
                </div>
                <div className="relative hidden flex-1 border-l border-white/10 md:block">
                  <img src="https://picsum.photos/seed/startup/800/800" alt="Startup" className="h-full w-full object-cover opacity-50 grayscale transition-all duration-700 hover:opacity-100 hover:grayscale-0" />
                </div>
              </div>
            </ScrollStackItem>

            <ScrollStackItem>
              <div className="mx-auto flex min-h-[50vh] w-[92vw] max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111] md:h-[65vh] md:w-[80vw] md:flex-row">
                <div className="relative h-40 w-full shrink-0 border-b border-white/10 md:hidden">
                  <img src="https://picsum.photos/seed/armall/800/800" alt="ArMall" className="h-full w-full object-cover opacity-60 grayscale" />
                </div>
                <div className="flex flex-1 flex-col justify-center p-6 md:p-12">
                  <h2 className="mb-2 text-3xl font-light uppercase tracking-widest md:mb-4 md:text-6xl">ArMall.pk</h2>
                  <p className="mb-6 text-sm font-light tracking-wider text-neutral-400 md:mb-10 md:text-lg">Ecommerce website design</p>
                  <div className="mt-auto flex flex-col gap-3 md:gap-6">
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-neutral-600 md:mb-2 md:text-sm">Backend</p>
                      <p className="text-xs font-light leading-relaxed tracking-wider text-neutral-300 md:text-base">Next.js, Mongoose, Clerk, MongoDB</p>
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-neutral-600 md:mb-2 md:text-sm">Frontend</p>
                      <p className="text-xs font-light tracking-wider text-neutral-300 md:text-base">Next.js, Tailwind</p>
                    </div>
                  </div>
                </div>
                <div className="relative hidden flex-1 border-l border-white/10 md:block">
                  <img src="https://picsum.photos/seed/armall/800/800" alt="ArMall" className="h-full w-full object-cover opacity-50 grayscale transition-all duration-700 hover:opacity-100 hover:grayscale-0" />
                </div>
              </div>
            </ScrollStackItem>
          </ScrollStack>
        </div>
      </section>

      <section className="relative z-50 flex min-h-[50vh] w-full flex-col items-center justify-center border-t border-white/5 bg-black px-4 pt-10 pb-20 text-white">
        <div className="mb-10 text-center text-xs font-light tracking-[0.5em] text-white/50 md:mb-16 md:text-sm">
          04 / CONTACT
        </div>
        <h2 className="cursor-pointer text-center text-4xl font-extralight uppercase tracking-widest text-white/90 transition-colors hover:text-white md:text-8xl">
          Let&apos;s Talk.
        </h2>
        <a href="mailto:hello@example.com" className="mt-8 break-all text-center text-xs font-light uppercase tracking-widest text-neutral-500 transition-colors hover:text-white md:text-sm">
          hello@yourdomain.com
        </a>
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-xs uppercase tracking-widest text-neutral-600 md:mt-16 md:gap-10 md:text-sm">
          <a href="#" className="transition-colors hover:text-white">LinkedIn</a>
          <a href="#" className="transition-colors hover:text-white">GitHub</a>
          <a href="#" className="transition-colors hover:text-white">Twitter</a>
        </div>
      </section>
    </div>
  );
}

