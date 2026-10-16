"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

/**
 * Fixed, full-viewport backdrop: aurora orbs drifting on CSS keyframes,
 * a masked grid, film grain and a vignette. Scrolling the page moves each
 * orb at a different speed (parallax) and slowly shifts the palette hue.
 */
const AnimatedBackground = () => {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    mass: 0.4,
  });

  const depth = reduceMotion ? 0 : 1;
  const orbA = useTransform(progress, [0, 1], [0, -260 * depth]);
  const orbB = useTransform(progress, [0, 1], [0, 180 * depth]);
  const orbC = useTransform(progress, [0, 1], [0, -420 * depth]);
  const gridY = useTransform(progress, [0, 1], [0, -120 * depth]);
  const hue = useTransform(
    progress,
    [0, 1],
    ["hue-rotate(0deg)", `hue-rotate(${50 * depth}deg)`]
  );

  return (
    <div aria-hidden className="bg-scene">
      <div className="bg-scene__base" />
      <motion.div className="absolute inset-0" style={{ filter: hue }}>
        <motion.div className="absolute inset-0" style={{ y: orbA }}>
          <div className="bg-scene__orb bg-scene__orb--a" />
        </motion.div>
        <motion.div className="absolute inset-0" style={{ y: orbB }}>
          <div className="bg-scene__orb bg-scene__orb--b" />
        </motion.div>
        <motion.div className="absolute inset-0" style={{ y: orbC }}>
          <div className="bg-scene__orb bg-scene__orb--c" />
        </motion.div>
      </motion.div>
      <motion.div className="absolute inset-0" style={{ y: gridY }}>
        <div className="bg-scene__grid" />
      </motion.div>
      <div className="bg-scene__noise" />
      <div className="bg-scene__vignette" />
    </div>
  );
};

export default AnimatedBackground;
