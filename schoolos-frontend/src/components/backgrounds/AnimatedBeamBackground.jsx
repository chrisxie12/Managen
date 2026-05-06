import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedBeamBackground = () => {
  return (
    <div style={styles.container}>
      <motion.div
        animate={{
          rotate: [0, 360],
          opacity: [0, 0.15, 0.05, 0.15, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
        style={styles.beam}
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
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  beam: {
    position: 'absolute',
    width: '200vw',
    height: '4px',
    background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
    transformOrigin: 'left center',
    filter: 'blur(40px)',
  }
};

