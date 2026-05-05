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
      /* Dark mode (default) */
      --bg-primary: var(--bg-primary);
      --bg-secondary: var(--bg-secondary);
      --card-bg: rgba(255, 255, 255, 0.03);
      --accent: #3b82f6;
      --accent-secondary: #6366f1;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --text-primary: var(--text-primary);
      --text-secondary: var(--text-secondary);
      --text-muted: var(--text-muted);
      --border: rgba(255, 255, 255, 0.06);
      --border-hover: rgba(59, 130, 246, 0.3);
      --surface-hover: rgba(255, 255, 255, 0.05);
      --shadow-card: 0 4px 24px rgba(0,0,0,0.4);
      --shadow-glow: 0 0 40px rgba(59,130,246,0.15);
      --shadow-intense: 0 0 80px rgba(59,130,246,0.25);
      
      /* Specific UI colors mapped to vars for easy replace */
      --sidebar-bg: var(--bg-secondary);
      --navbar-bg: rgba(8, 13, 26, 0.9);
      --input-bg: #161b2c;
      --table-header-bg: rgba(255, 255, 255, 0.04);
      --modal-bg: var(--bg-secondary);
      --hover-bg: rgba(255, 255, 255, 0.05);
      --glass-border: rgba(255, 255, 255, 0.07);
    }

    body.light-mode {
      /* Light mode overrides */
      --bg-primary: #f8fafc;
      --bg-secondary: #ffffff;
      --card-bg: #ffffff;
      --accent: #2563eb;
      --accent-secondary: #4f46e5;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-muted: var(--text-muted);
      --border: #e2e8f0;
      --border-hover: #93c5fd;
      --surface-hover: var(--text-primary);
      --shadow-card: 0 4px 24px rgba(0,0,0,0.05);
      --shadow-glow: 0 0 40px rgba(37,99,235,0.1);
      --shadow-intense: 0 0 80px rgba(37,99,235,0.15);
      
      --sidebar-bg: #ffffff;
      --navbar-bg: rgba(255, 255, 255, 0.9);
      --input-bg: var(--text-primary);
      --table-header-bg: #f8fafc;
      --modal-bg: #ffffff;
      --hover-bg: var(--text-primary);
      --glass-border: #e2e8f0;
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

