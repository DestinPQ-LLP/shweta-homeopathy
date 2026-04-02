'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import styles from './WhyChooseGrid.module.css';

interface WhyItem {
  icon: ReactNode;
  title: string;
  desc: string;
}

interface Props {
  items: WhyItem[];
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 36, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function WhyChooseGrid({ items }: Props) {
  return (
    <motion.div
      className={`grid-3 ${styles.whyGrid}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      {items.map((w) => (
        <motion.div
          key={w.title}
          className={`glass-card ${styles.whyCard}`}
          variants={cardVariants}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
        >
          <div className={styles.whyIcon}>{w.icon}</div>
          <h4>{w.title}</h4>
          <p>{w.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
