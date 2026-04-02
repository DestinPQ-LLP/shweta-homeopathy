'use client';

import { useScroll, useSpring, motion } from 'framer-motion';
import styles from './ScrollProgressRail.module.css';

export default function ScrollProgressRail() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className={styles.rail}
      style={{ scaleX, transformOrigin: '0%' }}
      aria-hidden="true"
    />
  );
}
