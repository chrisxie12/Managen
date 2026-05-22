const fs = require('fs');
const { execSync } = require('child_process');

// Original git version
const original = execSync('git show HEAD:routes/school.js', { encoding: 'utf8', cwd: 'C:/Users/Twumg/OneDrive/Documents/schoolos-backend/Managen' });
let d = 0;
const lines = original.split('\n');
for (let i = 0; i < lines.length; i++) {
  let line = lines[i].replace(/\/\/.*$/, '').replace(/'[^']*'/g, '').replace(/"[^"]*"/g, '').replace(/`[^`]*`/g, '');
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if (ch === '{') d++;
    if (ch === '}') d--;
  }
  if (d < 0) d = 0;
}
console.log('Original depth:', d);

// Edited version
const edited = fs.readFileSync('C:/Users/Twumg/OneDrive/Documents/schoolos-backend/Managen/routes/school.js', 'utf8');
d = 0;
const elines = edited.split('\n');
for (let i = 0; i < elines.length; i++) {
  let line = elines[i].replace(/\/\/.*$/, '').replace(/'[^']*'/g, '').replace(/"[^"]*"/g, '').replace(/`[^`]*`/g, '');
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if (ch === '{') d++;
    if (ch === '}') d--;
  }
  if (d < 0) d = 0;
}
console.log('Edited depth:', d);
