import React from 'react';
import { motion } from 'framer-motion';

export const FeatureCard = ({ icon: Icon, title, desc }) => {
  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 40 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-hover)" }}
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '40px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ fontSize: '40px', marginBottom: '24px', color: 'var(--accent-primary)' }}>
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <h3 style={{
        fontSize: '24px',
        fontWeight: '800',
        marginBottom: '16px',
        color: 'var(--text-primary)',
      }}>{title}</h3>
      <p style={{
        fontSize: '16px',
        color: 'var(--text-secondary)',
        lineHeight: '1.7',
      }}>{desc}</p>
    </motion.div>
  );
};
