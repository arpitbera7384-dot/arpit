import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX, Heart } from 'lucide-react';
import HeartsBackground from './components/HeartsBackground';
import aradhyaPhoto from './aradhya.jpeg';

export default function App() {
  const [step, setStep] = useState(1);
  const [finaleTriggered, setFinaleTriggered] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const polaroidRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const nextStep = () => {
    if (step === 1 && !hasStarted) {
      setHasStarted(true);
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      }
    }
    if (step < 5) setStep(step + 1);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const celebrate = () => {
    setFinaleTriggered(true);
    
    // Confetti explosion
    const duration = 5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 1 },
        colors: ['#ec4899', '#ef4444', '#f59e0b']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 1 },
        colors: ['#ec4899', '#ef4444', '#f59e0b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Emoji confetti
    const scalar = 2;
    const heart = confetti.shapeFromText({ text: '❤️', scalar });
    const star = confetti.shapeFromText({ text: '✨', scalar });

    setTimeout(() => {
      confetti({
        shapes: [heart, star],
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 500);
  };

  // Polaroid tilt effect
  useEffect(() => {
    const polaroid = polaroidRef.current;
    if (!polaroid || step !== 4) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = polaroid.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;
      
      gsap.to(polaroid, {
        rotateX,
        rotateY,
        scale: 1.05,
        duration: 0.1,
        ease: "power1.out"
      });
    };

    const handleMouseLeave = () => {
      gsap.to(polaroid, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)"
      });
    };

    polaroid.addEventListener('mousemove', handleMouseMove);
    polaroid.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      polaroid.removeEventListener('mousemove', handleMouseMove);
      polaroid.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [step]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const progress = (step / 5) * 100;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    },
    exit: { 
      opacity: 0, 
      y: -15, 
      transition: { 
        duration: 0.4 
      } 
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Layer 1: Aurora Background */}
      <div className="fixed inset-0 z-[-2] overflow-hidden bg-darkbg">
        <motion.div 
          animate={{ x: mousePos.x * 0.5, y: mousePos.y * 0.5 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          className="aurora-orb orb-1 w-[50vw] h-[50vw] top-[-10%] left-[-10%]" 
        />
        <motion.div 
          animate={{ x: -mousePos.x * 0.8, y: -mousePos.y * 0.8 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          className="aurora-orb orb-2 w-[60vw] h-[60vw] top-[20%] right-[-15%]" 
        />
        <motion.div 
          animate={{ x: mousePos.x * 0.3, y: -mousePos.y * 0.3 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          className="aurora-orb orb-3 w-[55vw] h-[55vw] bottom-[-15%] left-[10%]" 
        />
        <motion.div 
          animate={{ x: -mousePos.x * 0.6, y: mousePos.y * 0.6 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          className="aurora-orb orb-4 w-[45vw] h-[45vw] bottom-[10%] right-[10%]" 
        />
      </div>

      {/* Layer 2: 3D Hearts */}
      <HeartsBackground finaleTriggered={finaleTriggered} />

      {/* Music Toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
        onClick={toggleMute}
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </motion.button>

      {/* Progress Bar */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 w-[80vw] md:w-96 h-1.5 bg-white/10 rounded-full backdrop-blur-md z-50 overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-pink-500 to-red-500 relative"
          initial={{ width: "20%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-white/30 blur-[2px]" />
        </motion.div>
      </div>

      <main className="relative z-10 w-full h-screen flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="glass-card p-10 md:p-14 max-w-lg w-full text-center flex flex-col items-center"
            >
              <motion.div 
                variants={itemVariants}
                className="text-7xl mb-6"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ❤️
              </motion.div>
              <motion.h1 variants={itemVariants} className="font-serif text-4xl md:text-5xl font-bold mb-4 text-gradient drop-shadow-md">Hey Aradhya,</motion.h1>
              <motion.p variants={itemVariants} className="font-sans text-lg text-gray-200 mb-10 leading-relaxed font-light">
                I built a little world for you, just to bring a smile to your face on your special day.
              </motion.p>
              <motion.button 
                variants={itemVariants}
                className="btn-glow px-10 py-3.5 rounded-full font-bold text-white tracking-widest uppercase text-sm"
                onClick={nextStep}
              >
                Let's Begin
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="glass-card p-10 md:p-14 max-w-lg w-full text-center flex flex-col items-center"
            >
              <motion.div variants={itemVariants} className="text-7xl mb-6">🎉</motion.div>
              <motion.h1 variants={itemVariants} className="font-serif text-4xl md:text-5xl font-bold mb-4 text-gradient drop-shadow-md">Happy Birthday, Aradhya!</motion.h1>
              <motion.p variants={itemVariants} className="font-sans text-lg text-gray-200 mb-10 leading-relaxed font-light">
                Another year of you making the world brighter. Your existence is a gift, and I'm so lucky to witness it.
              </motion.p>
              <motion.button 
                variants={itemVariants}
                className="btn-glow px-10 py-3.5 rounded-full font-bold text-white tracking-widest uppercase text-sm"
                onClick={nextStep}
              >
                There's more...
              </motion.button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="glass-card p-8 md:p-12 max-w-3xl w-full flex flex-col items-center"
            >
              <motion.h1 variants={itemVariants} className="font-serif text-3xl md:text-4xl font-bold mb-8 text-gradient text-center drop-shadow-md">A Few Things I Adore About You</motion.h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-10">
                <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 p-6 rounded-2xl md:col-span-2 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <h2 className="text-xl font-serif text-pink-200 mb-2">✨ Your Unmatched Kindness</h2>
                  <p className="text-gray-300 text-sm md:text-base font-light">
                    The genuine warmth you show to everyone is something truly rare and beautiful.
                  </p>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <h2 className="text-xl font-serif text-pink-200 mb-2">😊 That Smile</h2>
                  <p className="text-gray-300 text-sm md:text-base font-light">It's a literal work of art.</p>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 p-6 rounded-2xl md:col-span-2 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <h2 className="text-xl font-serif text-pink-200 mb-2">🌟 Your Radiant Spirit</h2>
                  <p className="text-gray-300 text-sm md:text-base font-light">
                    Your passion for life is infectious. Being around you makes everything feel more exciting and possible.
                  </p>
                </motion.div>
              </div>
              <motion.button 
                variants={itemVariants}
                className="btn-glow px-10 py-3.5 rounded-full font-bold text-white tracking-widest uppercase text-sm"
                onClick={nextStep}
              >
                Remember this?
              </motion.button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="glass-card p-8 md:p-12 max-w-3xl w-full flex flex-col items-center relative"
            >
              <motion.h1 variants={itemVariants} className="font-serif text-3xl md:text-4xl font-bold mb-8 text-gradient drop-shadow-md">That One Time...</motion.h1>
              
              <div className="relative group flex flex-col items-center w-full">
                {/* Floating Decorative Elements */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute pointer-events-none text-yellow-300/60 z-20"
                    animate={{
                      y: [0, -20, 0],
                      x: [0, i % 2 === 0 ? 10 : -10, 0],
                      scale: [1, 1.2, 1],
                      rotate: [0, 45, 0],
                      opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{
                      duration: 3 + i,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.5
                    }}
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: i < 3 ? "0%" : "90%",
                    }}
                  >
                    {i % 2 === 0 ? '✨' : '⭐'}
                  </motion.div>
                ))}

                <motion.div 
                  variants={itemVariants}
                  ref={polaroidRef}
                  className="bg-white p-4 pb-6 rounded-sm shadow-2xl mb-8 cursor-pointer border border-gray-200 max-w-xs w-full"
                  style={{ transformStyle: 'preserve-3d', transform: 'rotate(-3deg)' }}
                >
                  <img 
                    src={aradhyaPhoto}
                    alt="Aradhya's Memory" 
                    className="w-full h-auto aspect-square object-cover mb-6 rounded-sm pointer-events-none shadow-inner"
                    referrerPolicy="no-referrer"
                  />
                  <p className="font-serif text-gray-800 text-center font-bold text-lg pointer-events-none italic">"The same beautiful smile, just a smaller version."</p>
                </motion.div>
              </div>

              <motion.p variants={itemVariants} className="font-sans text-gray-200 text-center mb-10 font-light text-lg">
                Even back then, you were destined to brighten up the world.
              </motion.p>

              {/* New Features Grid */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {[
                  "Your beautiful smile that brightens the room",
                  "The way you care for everyone around you",
                  "Your incredible strength and resilience",
                  "The magical way you see the world"
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 flex items-center space-x-4"
                  >
                    <Heart 
                      className="text-pink-400 shrink-0" 
                      fill="currentColor" 
                      size={20} 
                    />
                    <p className="text-white text-left font-medium text-lg leading-relaxed">
                      {item}
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.button 
                variants={itemVariants}
                className="btn-glow px-10 py-3.5 rounded-full font-bold text-white tracking-widest uppercase text-sm mt-16"
                onClick={nextStep}
              >
                One last thing...
              </motion.button>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="glass-card p-10 md:p-14 max-w-xl w-full text-center flex flex-col items-center relative overflow-hidden"
            >
              <motion.div variants={itemVariants} className="text-7xl mb-6">🎂</motion.div>
              <motion.h1 variants={itemVariants} className="font-serif text-4xl md:text-5xl font-bold mb-6 text-gradient drop-shadow-md">My Wish For You</motion.h1>
              <motion.p variants={itemVariants} className="font-sans text-lg text-gray-200 mb-8 leading-relaxed font-light">
                May the next year bring you all the love, success, and pure happiness you so rightfully deserve. May your dreams soar higher than ever.
              </motion.p>
              
              <AnimatePresence>
                {finaleTriggered && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full mt-4 mb-8"
                  >
                    <p className="text-3xl md:text-4xl font-serif font-bold text-gradient drop-shadow-md">
                      Happy Birthday, Aradhya! ❤️
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {!finaleTriggered && (
                <motion.button 
                  variants={itemVariants}
                  className="btn-glow px-10 py-3.5 rounded-full font-bold text-white tracking-widest uppercase text-sm mt-4"
                  onClick={celebrate}
                >
                  Celebrate!
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
