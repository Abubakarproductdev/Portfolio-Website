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
    description: "For my Final Year Project, I built an app called SIVO. Basically, I wanted to solve a real, everyday problem: the communication gap between the deaf community and hearing people.Instead of relying on a human interpreter, I built a two-way translator that fits right in your pocket. Here is how it works: you point your phone’s camera at someone using Pakistan Sign Language (PSL). The app tracks their hand and body movements, figures out what they are signing, and instantly speaks the words out loud. It also works in reverse—you can talk into the phone, and the app will translate your voice into sign language on the screen.",
    tech: {
      backend: "Python, Flask, TensorFlow",
      frontend: "React-Native"
    },
    images: [
      "https://picsum.photos/seed/sivo1/1920/1080",
      "https://picsum.photos/seed/sivo2/1920/1080"
    ],
    hardestPath: "Getting a heavy AI model to run in real-time on a mobile phone was honestly the hardest part. I built the mobile app using React Native, but I offloaded all the heavy AI processing—using tools like TensorFlow, MediaPipe, and OpenCV—to a custom Python cloud server.",
    challenges: "If I’m being honest, getting an AI to recognize a single, isolated sign—like 'Hello'—is actually pretty straightforward. You show the model the gesture, it memorizes the hand landmarks, and you’re good to go.But real life isn’t a flashcard app. In the real world, people sign continuously and fluidly.When a user transitions from signing the word 'Boss' to the word 'Send,' their hands move through the air in a very unpredictable way. To a trained AI, that blurry, halfway-there hand movement looks like a completely different, random word. Instead of predicting  my model was initially spitting out absolute gibberish like 'Boss... Make... Apple... Send.' The 'noise' between the signs was ruining the entire sentence.",
    MySolutions: `I spent weeks banging my head against the wall trying to fix this. I dug through dozens of academic research papers on sign language recognition, and I spent hours prompting every AI tool I could find (ChatGPT, Claude, etc.) begging for a solution.

But almost everything I found was either too theoretical or just flat-out didn't work for a real-time mobile app.

What the AI Suggested:
The AI models usually gave me standard, math-heavy computer science answers. The most common suggestion was to calculate Hand Speed (Velocity). The logic was: if the hands slow down or stop, the person is making a sign; if the hands are moving super fast, they are just transitioning between words, so the app should ignore those frames.

Why it failed in my case: It sounded great in theory, but it was a disaster in practice. Every single person signs at a different speed. Some people sign incredibly fast and fluidly, while others take their time. The velocity thresholds were way too fragile. If someone was just naturally a fast signer, the app thought everything was a transition and predicted nothing.

What the Academic Papers Suggested:
When I turned to university research papers, I found a different trend. A lot of researchers "solved" this problem by introducing a "Null" or "Neutral" sign. They basically trained their AI to recognize when a person’s hands were resting at their sides, and they forced the user to drop their hands back to a resting position between every single word.

Why it failed in my case: Technically, it worked, but practically? It was terrible. Imagine trying to have a normal, emotional conversation, but having to pause and drop your hands like a robot after every single word. It completely destroyed the natural flow of Pakistan Sign Language. My goal was to build an app for fluid human conversation, not a robotic lab experiment.

Engineering My Own Solution
I realized that the standard internet advice and academic tricks weren't going to cut it. I couldn't force deaf users to change how they talk just to make my app's job easier. The app had to adapt to them.

I had to stop trying to predict single frames perfectly and start looking at the bigger picture. That is when I threw out the standard playbook and built my own Customized Sliding Window approach.

Instead of looking at a single moment in time, I built a dynamic buffer that captures overlapping 30-frame blocks of video. The model evaluates the contextual flow of the entire movement, filtering out the transition noise naturally.

But I didn't stop there. Knowing that even the best sliding window might occasionally output a messy string of words, I engineered a Server-Side Smart Matcher. If the sliding window caught the messy keywords "Boss... send... word," the server instantly cross-references it against a database of valid, grammatically correct sentences and outputs: "Boss send project report."

By ignoring the standard "hand speed" and "null sign" advice and building a custom AI pipeline, I finally achieved a system that understands the intent of the user—reaching a 95% accuracy rate without ever asking them to slow down.`
  },
  agrimind: {
    title: "Agrimind",
    subtitle: "AI farmers resource allocation",
    description: "Agrimind revolutionizes modern agriculture by bringing intelligent resource allocation to the fingertips of farmers. Using an ecosystem of specialized AI agents powered by Langgraph, it predicts crop yields, optimizes water usage, and provides real-time market insights. The backend architecture seamlessly connects Python AI modeling with a robust Node.js and MongoDB foundation, while next-generation web technologies deliver actionable insights.",
    tech: { backend: "Python (AI agents), Langgraph, Node.js, MongoDB", frontend: "Next.js, Tailwind" },
    images: ["https://picsum.photos/seed/agrimind1/1920/1080", "https://picsum.photos/seed/agrimind2/1920/1080"],
    hardestPath: "Orchestrating multiple specialized AI agents without them getting stuck in infinite reasoning loops or losing context.",
    challenges: "The main challenge was managing the state between the Python Langgraph agents and the Node.js backend. Passing complex agricultural data seamlessly while keeping response times low was difficult.",
    MySolutions: "I designed a strict state-graph protocol in Langgraph to cap reasoning steps. I also built a unified API layer in Node.js to parse the agent outputs cleanly before delivering them to the Next.js frontend."
  },
  quant: {
    title: "Semi-Quant Auto",
    subtitle: "Future market strategy automation",
    description: "A high-performance algorithmic trading system engineered for future markets. Semi-Quant Auto minimizes human error and emotion by automating complex quantitative strategies. Developed purely in Python, the pipeline manages massive streams of market data, executes split-second decisions, and visualizes live performance through dynamic charting dashboards.",
    tech: { backend: "Python", frontend: "Python" },
    images: ["https://picsum.photos/seed/quant1/1920/1080", "https://picsum.photos/seed/quant2/1920/1080"],
    hardestPath: "Ensuring near-zero latency data processing and avoiding exchange API rate limits during high market volatility.",
    challenges: "Handling continuous, massive streams of tick data caused memory leaks in early versions. Additionally, rendering real-time charts blocked the main execution thread.",
    MySolutions: "I rewrote the data ingestion pipeline using Python's asyncio for concurrent processing. I also decoupled the trading logic from the UI charting, running them on separate processes to ensure executions never lagged."
  },
  startup: {
    title: "Startup Analyser",
    subtitle: "AI startup analyser using RAG system",
    description: "Startup Analyser provides deep, actionable intelligence on emerging companies by leveraging a sophisticated Retrieval-Augmented Generation (RAG) system. Investors and analysts can explore massive datasets of startup metrics, pitch decks, and market positioning. The system combines Redis caching and MongoDB for extreme speed, presented via a sleek React interface.",
    tech: { backend: "Python, Node.js, Express, MongoDB, Redis", frontend: "React.js" },
    images: ["https://picsum.photos/seed/startup1/1920/1080", "https://picsum.photos/seed/startup2/1920/1080"],
    hardestPath: "Achieving accurate context retrieval from highly unstructured data like pitch decks and complex financial metrics.",
    challenges: "Standard RAG approaches kept returning irrelevant chunks of text. Furthermore, querying the vector database simultaneously with MongoDB caused high latency on the frontend.",
    MySolutions: "I tuned the RAG embedding strategy to prioritize financial semantics and structural context. To solve the speed issue, I implemented Redis to cache frequent queries, slashing load times for the React UI."
  },
  armall: {
    title: "ArMall.pk",
    subtitle: "Ecommerce website design",
    description: "ArMall is a premium e-commerce platform redefining digital retail with speed, absolute security, and immersive design. The architecture is built on Next.js for lightning-fast server-side rendering, secured by Clerk authentication routines, and scaled globally with MongoDB and Mongoose. The frontend provides a buttery-smooth shopping experience accented by high-contrast brutalist aesthetics.",
    tech: { backend: "Next.js, Mongoose, Clerk, MongoDB", frontend: "Next.js, Tailwind" },
    images: ["https://picsum.photos/seed/armall1/1920/1080", "https://picsum.photos/seed/armall2/1920/1080"],
    hardestPath: "Maintaining strict data consistency between the Clerk authentication system and our custom MongoDB user records.",
    challenges: "Managing complex shopping cart states during Next.js Server-Side Rendering (SSR) without breaking the fluid UI animations or causing hydration errors.",
    MySolutions: "I utilized Clerk webhooks to instantly sync user data events into the Mongoose schemas. I also optimized Next.js server actions to handle cart mutations in the background, keeping the Tailwind interface snappy."
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
  const data = projectData["quant"];


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

            {/* TECH STACK / LINKS INLINE */}
            <motion.div
              animate={{ opacity: [0, 1] }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.9 }}
              className="mt-16 flex flex-row flex-wrap gap-12"
            >
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-neutral-600">Backend</p>
                <p className="text-sm font-light tracking-wider text-neutral-300">{data.tech.backend}</p>
              </div>
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-neutral-600">Frontend</p>
                <p className="text-sm font-light tracking-wider text-neutral-300">{data.tech.frontend}</p>
              </div>
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-neutral-600">Source Code</p>
                <a href={data.github || "https://github.com"} target="_blank" rel="noopener noreferrer" className="text-sm font-light tracking-wider text-neutral-300 hover:text-white underline underline-offset-4 decoration-white/30 transition-colors">
                  View on GitHub
                </a>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* OVERVIEW SECTION */}
        <section className="py-24 px-6 md:px-[10vw] border-t border-white/5 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h3 className="text-xs uppercase tracking-[0.5em] text-white/50 mb-10">01 / Overview</h3>
            <p className="text-base md:text-lg font-light leading-relaxed text-gray-300">
              {data.description}
            </p>
          </motion.div>
        </section>

        {/* HARDEST PATH SECTION */}
        <section className="py-24 px-6 md:px-[10vw] border-t border-white/5 bg-black/90">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h3 className="text-xs uppercase tracking-[0.5em] text-white/50 mb-10">03 / The Hardest Path</h3>
            <p className="text-base md:text-lg font-light leading-relaxed text-gray-300">
              {data.hardestPath}
            </p>
          </motion.div>
        </section>

        {/* CHALLENGES SECTION */}
        <section className="py-24 px-6 md:px-[10vw] border-t border-white/5 bg-[#050505]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h3 className="text-xs uppercase tracking-[0.5em] text-white/50 mb-10">04 / Challenges</h3>
            <p className="text-base md:text-lg font-light leading-relaxed text-gray-300 whitespace-pre-line">
              {data.challenges}
            </p>
          </motion.div>
        </section>

        {/* SOLUTIONS SECTION */}
        <section className="py-24 px-6 md:px-[10vw] border-t border-white/5 bg-black">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h3 className="text-xs uppercase tracking-[0.5em] text-white/50 mb-10">05 / Solutions</h3>
            <div className="text-base md:text-lg font-light leading-relaxed text-gray-300 whitespace-pre-line">
              {data.MySolutions}
            </div>
          </motion.div>
        </section>

        {/* DEMO VIDEO SECTION */}
        <section className="py-24 px-6 md:px-[10vw] border-t border-white/5 bg-[#050505]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <h3 className="text-xs uppercase tracking-[0.5em] text-white/50 mb-10">06 / Demo Video</h3>
            <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl bg-black">
              <video
                src="https://www.w3schools.com/html/mov_bbb.mp4"
                controls
                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500"
                poster={data.images[0]}
              />
            </div>
          </motion.div>
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
