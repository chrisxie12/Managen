import React from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  Zap, 
  ShieldCheck, 
  Bell, 
  Globe, 
  FileDown 
} from 'lucide-react';
import { theme } from '../theme';

const FeaturesModules = () => {
  const features = [
    {
      icon: Layers,
      title: "Multi-tenant Architecture",
      desc: "Each school gets its own isolated database. Your data stays yours."
    },
    {
      icon: Zap,
      title: "Instant Provisioning",
      desc: "School goes live in under 60 seconds after signup. Fully automated."
    },
    {
      icon: ShieldCheck,
      title: "Role-based Access",
      desc: "Admin, Teacher, Student, Parent — each sees only what they need."
    },
    {
      icon: Bell,
      title: "Real-time Notifications",
      desc: "SMS, email and WhatsApp alerts for fees, attendance, results and more."
    },
    {
      icon: Globe,
      title: "Custom Subdomain",
      desc: "Every school gets their own branded URL. yourschool.schoolos.com"
    },
    {
      icon: FileDown,
      title: "PDF & Excel Reports",
      desc: "Auto-generate report cards, fee receipts, payslips and more."
    }
  ];

  const modulesRow1 = [
    "QR Attendance", "Fee Management", "Exams", "Results", "Library",
    "Hostel Management", "Transport", "Payroll", "Chat", "Admissions",
    "Timetable", "Gradebook", "Parent Portal", "Staff Management"
  ];

  const modulesRow2 = [
    "Reports & Analytics", "Settings", "Announcements", "Events",
    "Notifications", "Document Store", "Health Records", "Canteen",
    "Alumni", "Visitor Log", "Asset Management", "ID Cards",
    "Bulk SMS", "WhatsApp Alerts"
  ];

  const sectionStyle = {
    padding: '100px 60px',
    maxWidth: '1100px',
    margin: '0 auto',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '64px',
  };

  const badgeStyle = {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: '9999px',
    background: 'rgba(59, 130, 246, 0.08)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    color: '#3b82f6',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '16px',
  };

  const h2Style = {
    fontFamily: "'Playfair Display', serif",
    fontSize: '42px',
    fontWeight: '800',
    marginBottom: '16px',
    color: 'var(--text-primary)',
  };

  const subtextStyle = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '18px',
    color: 'var(--text-secondary)',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: 1.6,
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  };

  const cardStyle = {
    backgroundColor: 'var(--card-bg)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    borderRadius: '16px',
    padding: '28px',
    transition: 'all 0.3s ease',
    cursor: 'default',
  };

  const iconWrapperStyle = {
    width: '48px',
    height: '48px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    color: '#3b82f6',
  };

  const cardTitleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: 'var(--text-primary)',
  };

  const cardDescStyle = {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  };

  // Modules Section Styles
  const modulesSectionStyle = {
    padding: '80px 0',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  };

  const marqueeContainerStyle = {
    display: 'flex',
    overflow: 'hidden',
    userSelect: 'none',
    maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
    WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
    gap: '12px',
    padding: '10px 0',
  };

  const pillStyle = {
    background: 'rgba(59, 130, 246, 0.08)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '9999px',
    padding: '8px 18px',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    fontFamily: "'DM Sans', sans-serif",
  };

  const marqueeRowStyle = (direction = 'left') => ({
    display: 'flex',
    gap: '12px',
    flexShrink: 0,
    animate: {
      x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
    },
    transition: {
      x: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 30,
        ease: "linear",
      },
    },
  });

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Part 1: Features Section */}
      <section style={sectionStyle}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={headerStyle}
        >
          <div style={badgeStyle}>✦ Everything You Need</div>
          <h2 style={h2Style}>Built for real schools</h2>
          <p style={subtextStyle}>Not a generic template. Every feature designed for how schools actually work.</p>
        </motion.div>

        <div style={gridStyle}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ 
                backgroundColor: 'var(--border)', 
                borderColor: 'rgba(59, 130, 246, 0.2)',
                y: -6 
              }}
              style={cardStyle}
            >
              <div style={iconWrapperStyle}>
                <f.icon size={28} />
              </div>
              <h3 style={cardTitleStyle}>{f.title}</h3>
              <p style={cardDescStyle}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Part 2: Modules Showcase Section */}
      <section style={modulesSectionStyle}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '48px', padding: '0 60px' }}
        >
          <h2 style={{ ...h2Style, fontSize: '36px' }}>40+ Modules. Everything a school needs.</h2>
        </motion.div>

        {/* Marquee Row 1 (Left) */}
        <div style={marqueeContainerStyle}>
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            style={{ display: 'flex', gap: '12px', flexShrink: 0 }}
          >
            {[...modulesRow1, ...modulesRow1].map((m, i) => (
              <div key={i} style={pillStyle}>{m}</div>
            ))}
          </motion.div>
        </div>

        {/* Marquee Row 2 (Right) */}
        <div style={{ ...marqueeContainerStyle, marginTop: '12px' }}>
          <motion.div
            animate={{ x: ['-50%', '0%'] }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            style={{ display: 'flex', gap: '12px', flexShrink: 0 }}
          >
            {[...modulesRow2, ...modulesRow2].map((m, i) => (
              <div key={i} style={pillStyle}>{m}</div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesModules;

