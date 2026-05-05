import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { theme } from '../theme';
import Navbar from './layout/Navbar';
import { ParticleBackground } from './backgrounds/ParticleBackground';

const Hero = () => {
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const containerStyle = {
    position: 'relative',
    width: '100%',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '0 20px',
    overflow: 'hidden',
    zIndex: 1,
  };

  const glowStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '800px',
    height: '800px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
    filter: 'blur(60px)',
    zIndex: -1,
    pointerEvents: 'none',
  };

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    borderRadius: '9999px',
    background: 'rgba(59, 130, 246, 0.08)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    color: '#3b82f6',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '24px',
  };

  const headlineStyle = {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(42px, 6vw, 76px)',
    fontWeight: '800',
    lineHeight: 1.05,
    letterSpacing: '-2px',
    color: 'var(--text-primary)',
    maxWidth: '900px',
    marginBottom: '24px',
  };

  const gradientTextStyle = {
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const subtextStyle = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '18px',
    color: 'var(--text-secondary)',
    maxWidth: '520px',
    lineHeight: 1.7,
    marginBottom: '40px',
  };

  const buttonContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '24px',
  };

  const ctaPrimaryStyle = {
    padding: '14px 32px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  };

  const ctaSecondaryStyle = {
    padding: '14px 32px',
    borderRadius: '12px',
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#e2e8f0',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const trustTextStyle = {
    fontSize: '13px',
    color: '#475569',
    marginBottom: '60px',
  };

  const statsRowStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '48px',
    marginTop: '20px',
  };

  const statItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const statValueStyle = {
    fontFamily: "'Playfair Display', serif",
    fontSize: '32px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const statLabelStyle = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginTop: '4px',
  };

  const stats = [
    { value: '40+', label: 'Modules' },
    { value: '99.9%', label: 'Uptime' },
    { value: '7-Day', label: 'Free Trial' },
    { value: '24/7', label: 'Support' }
  ];

  return (
    <>
      <Navbar />
      <ParticleBackground />
      
      <main style={containerStyle}>
        <div style={glowStyle} />

        {/* Top Badge */}
        <motion.div 
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          style={badgeStyle}
        >
          <span>✦</span> Trusted by schools across Ghana
        </motion.div>

        {/* Headline */}
        <motion.h1 
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeUp.transition, delay: 0.2 }}
          style={headlineStyle}
        >
          Run your school.<br />
          <span style={gradientTextStyle}>Not spreadsheets.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p 
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeUp.transition, delay: 0.3 }}
          style={subtextStyle}
        >
          Everything a school needs — attendance, fees, exams, payroll, library and 35+ more modules. One platform. One price.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeUp.transition, delay: 0.4 }}
          style={buttonContainerStyle}
        >
          <motion.button 
            whileHover={{ y: -2, filter: 'brightness(1.1)' }}
            whileTap={{ scale: 0.98 }}
            style={ctaPrimaryStyle}
          >
            Start 7-Day Free Trial <ArrowRight size={18} />
          </motion.button>
          <motion.button 
            whileHover={{ y: -2, backgroundColor: 'var(--hover-bg)' }}
            whileTap={{ scale: 0.98 }}
            style={ctaSecondaryStyle}
          >
            View Live Demo
          </motion.button>
        </motion.div>

        {/* Trust Text */}
        <motion.div 
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeUp.transition, delay: 0.5 }}
          style={trustTextStyle}
        >
          No credit card required • Setup in 60 seconds • Cancel anytime
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ ...fadeUp.transition, delay: 0.6 }}
          style={statsRowStyle}
        >
          {stats.map((stat, index) => (
            <div key={index} style={statItemStyle}>
              <span style={statValueStyle}>{stat.value}</span>
              <span style={statLabelStyle}>{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </main>
    </>
  );
};

export default Hero;
