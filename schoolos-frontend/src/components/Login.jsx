import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock as ClockIcon, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  BookUser, 
  GraduationCap, 
  Heart, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { theme } from '../theme';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate login delay
    setTimeout(() => {
      setLoading(false);
      setError('Invalid credentials. Please contact your administrator.');
    }, 1500);
  };

  const fadeUp = (delay) => ({
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: "easeOut" }
  });

  const roles = [
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
    { id: 'teacher', label: 'Teacher', icon: BookUser },
    { id: 'student', label: 'Student', icon: GraduationCap },
    { id: 'parent', label: 'Parent', icon: Heart },
  ];

  const floatingOrbStyle = (color, size, top, left, blur, opacity, animationName) => ({
    position: 'absolute',
    width: size,
    height: size,
    top,
    left,
    background: color,
    filter: `blur(${blur})`,
    opacity,
    borderRadius: '50%',
    zIndex: 0,
    animation: `${animationName} 15s infinite alternate ease-in-out`,
  });

  return (
    <div style={{ 
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* Background CSS Keyframes */}
      <style>{`
        @keyframes float1 { from { transform: translate(0, 0); } to { transform: translate(30px, 50px); } }
        @keyframes float2 { from { transform: translate(0, 0); } to { transform: translate(-40px, -20px); } }
        @keyframes float3 { from { transform: translate(0, 0); } to { transform: translate(20px, -40px); } }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }
      `}</style>

      {/* Grid Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        zIndex: 1,
      }} />

      {/* Floating Orbs */}
      <div style={floatingOrbStyle('#3b82f6', '500px', '10%', '10%', '120px', '0.08', 'float1')} />
      <div style={floatingOrbStyle('#6366f1', '400px', '60%', '60%', '120px', '0.08', 'float2')} />
      <div style={floatingOrbStyle('#06b6d4', '300px', '40%', '30%', '100px', '0.06', 'float3')} />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={mounted ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--card-bg)',
          border: '1px solid rgba(59, 130, 246, 0.15)',
          borderRadius: '24px',
          padding: '40px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 60px rgba(59, 130, 246, 0.08)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* 1. Top Bar */}
        <motion.div {...fadeUp(0.1)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#3b82f6' }}>
            <ClockIcon size={14} />
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
            <Calendar size={14} />
            {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </motion.div>

        {/* 2. School Identity */}
        <motion.div {...fadeUp(0.2)} style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)', 
            margin: '0 auto 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 'bold',
            color: 'white',
            animation: 'pulseGlow 2s infinite'
          }}>
            GA
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Greenfield Academy
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <MapPin size={12} /> Accra, Ghana
          </div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
            Second Term • 2025/2026
          </div>
        </motion.div>

        {/* 3. Role Selector */}
        <motion.div {...fadeUp(0.3)} style={{ display: 'flex', background: 'var(--card-bg)', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 4px',
                borderRadius: '8px',
                fontSize: '12px',
                border: role === r.id ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                background: role === r.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: role === r.id ? '#3b82f6' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: role === r.id ? '0 0 12px rgba(59, 130, 246, 0.2)' : 'none',
              }}
            >
              <r.icon size={14} />
              {r.label}
            </button>
          ))}
        </motion.div>

        <form onSubmit={handleLogin}>
          {/* 4. Email Input */}
          <motion.div {...fadeUp(0.4)} style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '13px 16px 13px 44px',
                  background: 'var(--table-header-bg)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </motion.div>

          {/* 5. Password Input */}
          <motion.div {...fadeUp(0.45)} style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '13px 44px',
                  background: 'var(--table-header-bg)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                }}
              />
              <div 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#475569' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </div>
            </div>
          </motion.div>

          {/* 6. Remember Me + Forgot Password */}
          <motion.div {...fadeUp(0.5)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '13px' }}>
              <input type="checkbox" style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }} />
              Remember me
            </label>
            <a href="#" style={{ color: '#3b82f6', fontSize: '13px', textDecoration: 'none' }}>Forgot password?</a>
          </motion.div>

          {/* 7. Sign In Button */}
          <motion.button
            {...fadeUp(0.55)}
            disabled={loading}
            whileHover={{ y: -2, filter: 'brightness(1.1)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '15px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                Signing in...
              </>
            ) : "Sign In"}
          </motion.button>
        </form>

        {/* 8. Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#ef4444',
                fontSize: '13px',
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 9. Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '12px', color: '#475569' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* 10. Quick Stats Bar */}
        <motion.div {...fadeUp(0.6)} style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
          {[
            { v: '847', l: 'Students' },
            { v: '62', l: 'Teachers' },
            { v: '24', l: 'Classes' },
            { v: '94%', l: 'Pass' }
          ].map((s, i) => (
            <React.Fragment key={i}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 'bold' }}>{s.v}</div>
                <div style={{ color: '#475569', fontSize: '11px' }}>{s.l}</div>
              </div>
              {i < 3 && <div style={{ width: '1px', height: '20px', background: 'var(--border)', marginTop: '4px' }} />}
            </React.Fragment>
          ))}
        </motion.div>

        {/* 11. Footer */}
        <motion.div {...fadeUp(0.65)} style={{ textAlign: 'center', fontSize: '12px', color: '#475569' }}>
          Powered by <span style={{ color: '#3b82f6' }}>SchoolOS</span> ⚡
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;
