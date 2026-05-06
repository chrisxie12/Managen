import React from 'react';

export const HorizontalLinesBackground = () => {
  return (
    <div style={styles.container}>
      <div style={styles.lines} />
      <div style={styles.glow} />
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
  lines: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
    backgroundSize: '100% 40px',
  },
  glow: {
    position: 'absolute',
    top: '-5%',
    right: '-5%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
    filter: 'blur(60px)',
  }
};

