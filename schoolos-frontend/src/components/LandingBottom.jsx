import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Star, 
  Mail, 
  Phone, 
  Twitter, 
  Linkedin, 
  Github,
  MapPin
} from 'lucide-react';
import { theme } from '../theme';

const LandingBottom = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const testimonials = [
    {
      school: "Greenfield Academy",
      location: "Accra, Ghana",
      name: "Mr. Kwame Asante",
      role: "Head Administrator",
      quote: "SchoolOS completely transformed how we manage our school. Fee collection alone saves us 10 hours every week.",
      stars: 5,
      initials: "GA",
      color: "#3b82f6"
    },
    {
      school: "Sunrise International School",
      location: "Kumasi, Ghana",
      name: "Mrs. Abena Mensah",
      role: "School Director",
      quote: "The parent portal and WhatsApp notifications have improved our communication with parents tremendously.",
      stars: 5,
      initials: "SI",
      color: "#10b981"
    },
    {
      school: "Kings College Prep",
      location: "Takoradi, Ghana",
      name: "Mr. Kofi Boateng",
      role: "IT Administrator",
      quote: "Setup was incredibly fast. Our school was live in under 2 minutes. The support team is always available.",
      stars: 5,
      initials: "KC",
      color: "#f472b6"
    }
  ];

  const faqs = [
    {
      q: "How does the 7-day free trial work?",
      a: "You get full access to all features in your chosen plan for 7 days. No credit card required. After 7 days choose a plan to continue."
    },
    {
      q: "Can multiple schools use the same platform?",
      a: "Yes. Each school gets their own isolated subdomain and database. No school can ever see another school's data."
    },
    {
      q: "What payment methods are accepted?",
      a: "We accept MTN Mobile Money, Vodafone Cash, AirtelTigo Money, bank cards and direct bank transfers in Ghana Cedis."
    },
    {
      q: "Can I upgrade or downgrade my plan?",
      a: "Yes. You can change your plan at any time. Upgrades take effect immediately. Downgrades take effect at the next billing cycle."
    },
    {
      q: "What happens if I miss a payment?",
      a: "We'll retry your payment 3 times. If all retries fail your account will be suspended. You can reactivate anytime by making payment."
    },
    {
      q: "Is my school's data secure?",
      a: "Yes. Each school has an isolated database with Row Level Security. All data is encrypted and backed up daily on Supabase."
    }
  ];

  const footerLinks = {
    Product: ["Features", "Modules", "Pricing", "Changelog", "Roadmap"],
    Company: ["About", "Blog", "Careers", "Press", "Partners"],
    Support: ["Documentation", "Help Center", "Contact Us", "Status", "Privacy Policy"]
  };

  const sectionStyle = {
    padding: '100px 60px',
    maxWidth: '1100px',
    margin: '0 auto',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
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
    textAlign: 'center',
  };

  const h2Style = {
    fontFamily: "'Playfair Display', serif",
    fontSize: '42px',
    fontWeight: '800',
    marginBottom: '16px',
    textAlign: 'center',
  };

  const subtextStyle = {
    fontSize: '18px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto 64px auto',
  };

  const testimonialGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
  };

  const cardStyle = {
    background: 'var(--card-bg)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    borderRadius: '16px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    transition: 'all 0.3s ease',
  };

  const avatarStyle = (color) => ({
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    color: 'white',
  });

  // Footer Styles
  const footerStyle = {
    padding: '60px 60px 32px 60px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    marginTop: '80px',
  };

  const footerGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '40px',
    marginBottom: '60px',
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Part 1: Testimonials Section */}
      <section style={sectionStyle}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center' }}
        >
          <div style={badgeStyle}>✦ What Schools Say</div>
          <h2 style={h2Style}>Trusted by school administrators</h2>
          <p style={subtextStyle}>Join hundreds of schools already running on SchoolOS</p>
        </motion.div>

        <div style={testimonialGridStyle}>
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, borderColor: 'rgba(59, 130, 246, 0.2)' }}
              style={cardStyle}
            >
              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(t.stars)].map((_, idx) => (
                  <Star key={idx} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6 }}>
                "{t.quote}"
              </p>
              <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={avatarStyle(t.color)}>{t.initials}</div>
                <div>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '15px' }}>{t.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{t.role}, {t.school}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '12px', marginTop: '2px' }}>
                    <MapPin size={12} /> {t.location}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Part 2: FAQ Section */}
      <section style={{ ...sectionStyle, maxWidth: '700px', backgroundColor: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <h2 style={{ ...h2Style, marginTop: '20px' }}>Frequently Asked Questions</h2>
        <p style={subtextStyle}>Everything you need to know about SchoolOS</p>

        <div style={{ marginTop: '40px' }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', padding: '20px 0' }}>
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: '500' }}>{faq.q}</span>
                <motion.div
                  animate={{ rotate: openFaqIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ color: 'var(--text-muted)' }}
                >
                  <ChevronDown size={20} />
                </motion.div>
              </button>
              <AnimatePresence>
                {openFaqIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, marginTop: '16px' }}>
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Part 3: CTA Banner */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          margin: '80px 60px',
          borderRadius: '24px',
          padding: '80px 60px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(99, 102, 241, 0.08))',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ ...h2Style, fontSize: '42px', marginBottom: '20px' }}>Ready to modernize your school?</h2>
        <p style={{ ...subtextStyle, margin: '0 auto 40px auto' }}>
          Join schools across Ghana already running on SchoolOS. Your school goes live in 60 seconds.
        </p>
        <motion.button
          whileHover={{ y: -2, boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)' }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '16px 40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          Get Started Free — No Card Needed
        </motion.button>
        <p style={{ fontSize: '13px', color: '#475569' }}>
          7-day free trial • GHS 450/mo after trial • Cancel anytime
        </p>
      </motion.section>

      {/* Part 4: Footer */}
      <footer style={footerStyle}>
        <div style={footerGridStyle}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', background: '#3b82f6', borderRadius: '8px' }} />
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '18px' }}>SchoolOS</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              Run your school. Not spreadsheets.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Twitter size={20} style={{ color: '#475569', cursor: 'pointer' }} />
              <Linkedin size={20} style={{ color: '#475569', cursor: 'pointer' }} />
              <Github size={20} style={{ color: '#475569', cursor: 'pointer' }} />
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 'bold', marginBottom: '20px' }}>{title}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    style={{ color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <p style={{ color: '#475569', fontSize: '13px' }}>
            © 2025 SchoolOS. All rights reserved.
          </p>
          <p style={{ color: '#475569', fontSize: '13px' }}>
            Made with ❤️ in Ghana 🇬🇭
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingBottom;

