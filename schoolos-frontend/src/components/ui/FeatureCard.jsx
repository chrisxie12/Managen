import React from 'react';
import { motion } from 'framer-motion';

export const FeatureCard = ({ icon: Icon, title, desc }) => {
  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 40 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, backgroundColor: "rgba(15, 23, 42, 0.02)", borderColor: "rgba(45, 125, 250, 0.3)" }}
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '24px',
        padding: '40px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ fontSize: '40px', marginBottom: '24px', color: '#2D7DFA' }}>
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
