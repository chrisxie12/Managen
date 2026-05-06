import React from 'react';

export const WarmDarkBackground = () => {
  return (
    <div style={styles.container}>
      <div style={styles.grid} />
      <div style={styles.glow} />
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    backgroundColor: '#0a0810',
    zIndex: 0,
    overflow: 'hidden',
    pointerEvents: 'none'
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
  },
  glow: {
    position: 'absolute',
    bottom: '-10%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '800px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
    filter: 'blur(40px)',
  }
};

