import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const navLinks = [
    { name: 'Features', href: '#' },
    { name: 'Modules', href: '#' },
    { name: 'Pricing', href: '#' },
    { name: 'FAQ', href: '#' },
  ];

  const navbarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: scrolled ? '56px' : '68px',
    backgroundColor: 'rgba(4, 8, 18, 0.8)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isMobile ? '0 20px' : '0 60px',
    zIndex: 100,
    transition: 'all 0.3s ease-in-out',
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    textDecoration: 'none',
  };

  const logoIconStyle = {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '20px',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  };

  const logoTextStyle = {
    fontFamily: "'Playfair Display', serif",
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
  };

  const navLinksContainerStyle = {
    display: isMobile ? 'none' : 'flex',
    alignItems: 'center',
    gap: '32px',
    position: 'relative',
  };

  const navLinkStyle = (index) => ({
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    color: hoveredLink === index ? 'var(--text-primary)' : 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    position: 'relative',
    padding: '4px 0',
  });

  const underlineStyle = (index) => ({
    position: 'absolute',
    bottom: -4,
    left: 0,
    width: '100%',
    height: '2px',
    backgroundColor: '#3b82f6',
    transform: hoveredLink === index ? 'scaleX(1)' : 'scaleX(0)',
    transformOrigin: 'left',
    transition: 'transform 0.3s ease',
  });

  const buttonContainerStyle = {
    display: isMobile ? 'none' : 'flex',
    alignItems: 'center',
    gap: '16px',
  };

  const signInButtonStyle = {
    padding: '8px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const trialButtonStyle = {
    padding: '8px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
  };

  const drawerStyle = {
    position: 'fixed',
    top: 0,
    right: menuOpen ? 0 : '-100%',
    width: '100%',
    height: '100vh',
    backgroundColor: 'var(--bg-secondary)',
    zIndex: 101,
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'right 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const handleLinkHover = (index) => setHoveredLink(index);
  const handleButtonHover = (e, isTrial) => {
    e.target.style.transform = 'translateY(-2px)';
    if (isTrial) {
      e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
    } else {
      e.target.style.borderColor = 'rgba(255, 255, 255, 0.24)';
      e.target.style.color = '#ffffff';
    }
  };

  const handleButtonLeave = (e, isTrial) => {
    e.target.style.transform = 'translateY(0)';
    if (isTrial) {
      e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
    } else {
      e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
      e.target.style.color = '#e2e8f0';
    }
  };

  return (
    <>
      <nav style={navbarStyle}>
        {/* Logo Section */}
        <div style={logoContainerStyle}>
          <div style={logoIconStyle}>S</div>
          <span style={logoTextStyle}>SchoolOS</span>
        </div>

        {/* Desktop Nav Links */}
        <div style={navLinksContainerStyle}>
          {navLinks.map((link, index) => (
            <a
              key={link.name}
              href={link.href}
              style={navLinkStyle(index)}
              onMouseEnter={() => handleLinkHover(index)}
              onMouseLeave={() => handleLinkHover(null)}
            >
              {link.name}
              <div style={underlineStyle(index)} />
            </a>
          ))}
        </div>

        {/* Right Section Buttons / Mobile Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={buttonContainerStyle}>
            <button
              style={signInButtonStyle}
              onMouseEnter={(e) => handleButtonHover(e, false)}
              onMouseLeave={(e) => handleButtonLeave(e, false)}
            >
              Sign In
            </button>
            <button
              style={trialButtonStyle}
              onMouseEnter={(e) => handleButtonHover(e, true)}
              onMouseLeave={(e) => handleButtonLeave(e, true)}
            >
              Start Free Trial
            </button>
          </div>

          {isMobile && (
            <button
              onClick={() => setMenuOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Menu size={24} />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div style={drawerStyle}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            <X size={32} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '24px',
                fontWeight: '500',
                color: 'var(--text-primary)',
                textDecoration: 'none',
              }}
            >
              {link.name}
            </a>
          ))}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            style={{
              ...signInButtonStyle,
              width: '100%',
              padding: '16px',
              fontSize: '16px',
            }}
          >
            Sign In
          </button>
          <button
            style={{
              ...trialButtonStyle,
              width: '100%',
              padding: '16px',
              fontSize: '16px',
            }}
          >
            Start Free Trial
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
