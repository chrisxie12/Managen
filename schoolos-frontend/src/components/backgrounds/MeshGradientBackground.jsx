import React from 'react';

export const MeshGradientBackground = () => {
  return (
    <div style={styles.container}>
      <div style={styles.mesh} />
      <div style={styles.noise} />
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
  mesh: {
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(ellipse at 80% 0%, rgba(59, 130, 246, 0.06) 0%, transparent 60%),
      radial-gradient(ellipse at 20% 100%, rgba(99, 102, 241, 0.04) 0%, transparent 50%)
    `,
  },
  noise: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    opacity: 0.03,
    mixBlendMode: 'overlay',
  }
};
