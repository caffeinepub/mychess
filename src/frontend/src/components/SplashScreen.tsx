import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onDismiss: () => void;
}

export default function SplashScreen({ onDismiss }: SplashScreenProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      setLeaving(true);
      setTimeout(onDismiss, 600);
    }, 2200);
    return () => clearTimeout(dismissTimer);
  }, [onDismiss]);

  const pieces = ["♔", "♕", "♖", "♗", "♘", "♙", "♚", "♛"];

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center chess-bg"
          style={{ background: "#000" }}
          onClick={() => {
            setLeaving(true);
            setTimeout(onDismiss, 600);
          }}
        >
          {/* Decorative floating pieces */}
          {pieces.map((p, i) => (
            <motion.span
              key={p}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.07, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
              className="absolute text-white select-none pointer-events-none"
              style={{
                fontSize: "clamp(48px, 8vw, 120px)",
                left: `${8 + i * 12}%`,
                top: i % 2 === 0 ? "15%" : "72%",
              }}
            >
              {p}
            </motion.span>
          ))}

          {/* Main logo */}
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="text-center relative z-10"
          >
            <div
              className="text-white font-serif font-bold tracking-tight select-none"
              style={{
                fontSize: "clamp(64px, 14vw, 160px)",
                lineHeight: 1,
                letterSpacing: "-0.04em",
              }}
            >
              MyChess
            </div>
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mt-4 h-px bg-white mx-auto"
              style={{ width: "60%" }}
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="mt-4 text-white font-sans tracking-[0.3em] uppercase text-sm"
            >
              Play · Study · Community
            </motion.p>
          </motion.div>

          {/* Click to continue hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute bottom-8 text-white text-xs tracking-widest uppercase font-sans"
          >
            Click anywhere to continue
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
