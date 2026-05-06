export const theme = {
  colors: {
    background: 'var(--bg-primary)',
    backgroundSecondary: 'var(--bg-secondary)',
    card: 'var(--card-bg)',
    accent: 'var(--accent)',
    accentSecondary: 'var(--accent-secondary)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger: 'var(--danger)',
    textPrimary: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    textMuted: 'var(--text-muted)',
    border: 'var(--border)',
    borderHover: 'var(--border-hover)',
    surfaceHover: 'var(--surface-hover)',
  },
  typography: {
    fontHeading: 'Playfair Display, serif',
    fontBody: 'DM Sans, sans-serif',
    fontMono: 'JetBrains Mono, monospace',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
  shadows: {
    card: 'var(--shadow-card)',
    glow: 'var(--shadow-glow)',
    intense: 'var(--shadow-intense)',
  },
  globalStyles: `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

    :root {
      /* Base Theme (Milk & Plum Light) */
      --bg-primary: #FFF3E6;
      --bg-secondary: #F9F1E7;
      --card-bg: #ffffff;
      --accent: #381932;
      --accent-secondary: #512b4a;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --text-primary: #381932;
      --text-secondary: #512b4a;
      --text-muted: #7d6077;
      --border: rgba(56, 25, 50, 0.08);
      --border-hover: rgba(56, 25, 50, 0.3);
      --surface-hover: rgba(56, 25, 50, 0.05);
      --shadow-card: 0 4px 24px rgba(56, 25, 50, 0.08);
      --shadow-glow: 0 0 40px rgba(56, 25, 50, 0.15);
      --shadow-intense: 0 0 80px rgba(56, 25, 50, 0.25);
      
      /* Specific UI colors */
      --sidebar-bg: var(--bg-secondary);
      --navbar-bg: rgba(255, 243, 230, 0.9);
      --input-bg: #ffffff;
      --table-header-bg: rgba(56, 25, 50, 0.04);
      --modal-bg: #ffffff;
      --hover-bg: rgba(56, 25, 50, 0.05);
      --glass-border: rgba(56, 25, 50, 0.07);
    }

    body.dark-mode {
      /* Plum & Milk Dark Mode */
      --bg-primary: #381932;
      --bg-secondary: #2d1428;
      --card-bg: rgba(255, 255, 255, 0.04);
      --accent: #FFF3E6;
      --accent-secondary: #fdfaf5;
      --text-primary: #FFF3E6;
      --text-secondary: #fdfaf5;
      --text-muted: #e8dccf;
      --border: rgba(255, 255, 255, 0.1);
      --border-hover: rgba(255, 243, 230, 0.4);
      --surface-hover: rgba(255, 255, 255, 0.08);
      --shadow-card: 0 4px 24px rgba(0,0,0,0.4);
      --shadow-glow: 0 0 40px rgba(255, 243, 230, 0.1);
      --shadow-intense: 0 0 80px rgba(255, 243, 230, 0.2);
      
      --sidebar-bg: #2d1428;
      --navbar-bg: rgba(56, 25, 50, 0.9);
      --input-bg: rgba(0, 0, 0, 0.2);
      --table-header-bg: rgba(255, 255, 255, 0.05);
      --modal-bg: #2d1428;
      --hover-bg: rgba(255, 255, 255, 0.05);
      --glass-border: rgba(255, 255, 255, 0.08);
    }

    body {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-family: 'DM Sans', sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: 'Playfair Display', serif;
    }

    code, pre {
      font-family: 'JetBrains Mono', monospace;
    }

    * {
      box-sizing: border-box;
    }
  `
};

