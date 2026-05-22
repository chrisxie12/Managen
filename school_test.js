const fs = require('fs');
const c = fs.readFileSync('C:/Users/Twumg/OneDrive/Documents/schoolos-backend/Managen/routes/school.js', 'utf8');
let depth = 0;
const lines = c.split('\n');
for (let i = 0; i < lines.length; i++) {
  let line = lines[i]
    .replace(/\/\/.*$/, '')
    .replace(/'[^']*'/g, '')
    .replace(/"[^"]*"/g, '')
    .replace(/`[^`]*`/g, '');
  const prev = depth;
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if (ch === '{') depth++;
    if (ch === '}') depth--;
  }
  if (prev !== depth && depth >= 0) {
    console.log('Line ' + (i+1) + ': depth ' + prev + ' -> ' + depth + ' | ' + lines[i].trim().substring(0, 70));
  }
  if (depth < 0) {
    console.log('NEGATIVE at line', i + 1, ':', lines[i].trim().substring(0, 70));
    depth = 0;
  }
}
console.log('Final depth:', depth);
