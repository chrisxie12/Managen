const fs = require('fs');
const path = require('path');

const replacements = {
  "'#040812'": "'var(--bg-primary)'",
  '"#040812"': "'var(--bg-primary)'",
  "'#0a0f1e'": "'var(--bg-secondary)'",
  '"#0a0f1e"': "'var(--bg-secondary)'",
  "'#f1f5f9'": "'var(--text-primary)'",
  '"#f1f5f9"': "'var(--text-primary)'",
  "'#64748b'": "'var(--text-muted)'",
  '"#64748b"': "'var(--text-muted)'",
  "'#94a3b8'": "'var(--text-secondary)'",
  '"#94a3b8"': "'var(--text-secondary)'",
  "'rgba(8, 13, 26, 0.9)'": "'var(--navbar-bg)'",
  "'rgba(255, 255, 255, 0.03)'": "'var(--card-bg)'",
  "'rgba(255,255,255,0.03)'": "'var(--card-bg)'",
  "'rgba(255, 255, 255, 0.04)'": "'var(--table-header-bg)'",
  "'rgba(255,255,255,0.04)'": "'var(--table-header-bg)'",
  "'rgba(255, 255, 255, 0.05)'": "'var(--hover-bg)'",
  "'rgba(255,255,255,0.05)'": "'var(--hover-bg)'",
  "'rgba(255, 255, 255, 0.06)'": "'var(--border)'",
  "'rgba(255,255,255,0.06)'": "'var(--border)'",
  "'rgba(255, 255, 255, 0.07)'": "'var(--glass-border)'",
  "'rgba(255,255,255,0.07)'": "'var(--glass-border)'",
  "'#161b2c'": "'var(--input-bg)'",
  '"#161b2c"': "'var(--input-bg)'"
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const srcDir = path.join(__dirname, '../schoolos-frontend/src');

walkDir(srcDir, function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    for (const [key, value] of Object.entries(replacements)) {
      if (content.includes(key)) {
        content = content.split(key).join(value);
        modified = true;
      }
    }
    
    // Also replace raw hexes without quotes inside template strings
    const hexReplacements = {
      '#040812': 'var(--bg-primary)',
      '#0a0f1e': 'var(--bg-secondary)',
      '#f1f5f9': 'var(--text-primary)',
      '#64748b': 'var(--text-muted)',
      '#94a3b8': 'var(--text-secondary)'
    };
    for (const [key, value] of Object.entries(hexReplacements)) {
       // Look for cases where they might be inside template literals like `${...}1a` or plain css strings
       // but be careful not to replace them inside import paths (rare, but good to be careful).
       // A simple global replace is usually fine if we check if it is part of a CSS string.
       // Actually, just let it replace globally because these are very specific hex codes.
       if (content.includes(key)) {
           content = content.split(key).join(value);
           modified = true;
       }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
