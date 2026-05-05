import React from 'react';
import { motion } from 'framer-motion';

export const AuroraBackground = () => {
  return (
    <div style={styles.container}>
      <motion.div
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          opacity: [0.05, 0.08, 0.05],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={styles.aurora}
      />
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'var(--bg-primary)',
    zIndex: 0,
    overflow: 'hidden',
    pointerEvents: 'none'
  },
  aurora: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, #3b82f6, #06b6d4, #10b981, #6366f1)',
    backgroundSize: '400% 400%',
    filter: 'blur(80px)',
  }
};
