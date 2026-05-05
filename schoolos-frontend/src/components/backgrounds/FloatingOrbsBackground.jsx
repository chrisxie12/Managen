import React from 'react';
import { motion } from 'framer-motion';

export const FloatingOrbsBackground = () => {
  return (
    <div style={styles.container}>
      {/* Dot Grid */}
      <div style={styles.grid} />

      {/* Floating Orbs */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 15, 0],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ ...styles.orb, ...styles.orb1 }}
      />
      
      <motion.div
        animate={{
          x: [0, -40, 20, 0],
          y: [0, 30, -10, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ ...styles.orb, ...styles.orb2 }}
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.08, 0.12, 0.08],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ ...styles.orb, ...styles.orb3 }}
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
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `radial-gradient(circle, rgba(59, 130, 246, 0.15) 1px, transparent 1px)`,
    backgroundSize: '32px 32px',
  },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(120px)',
    willChange: 'transform',
  },
  orb1: {
    width: '600px',
    height: '600px',
    background: '#3b82f6',
    top: '-100px',
    left: '-100px',
    opacity: 0.1,
  },
  orb2: {
    width: '500px',
    height: '500px',
    background: '#6366f1',
    bottom: '-100px',
    right: '-100px',
    opacity: 0.08,
  },
  orb3: {
    width: '400px',
    height: '400px',
    background: '#06b6d4',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    opacity: 0.06,
  }
};
