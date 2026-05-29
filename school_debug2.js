const { execSync } = require('child_process');
const diff = execSync('git diff routes/school.js', { encoding: 'utf8', cwd: 'C:/Users/Twumg/OneDrive/Documents/schoolos-backend/Managen' });

let net = 0;
for (const line of diff.split('\n')) {
  if (line.startsWith('+') && !line.startsWith('+++')) {
    const content = line.slice(1);
    let opens = 0, closes = 0;
    for (const ch of content) {
      if (ch === '{') opens++;
      if (ch === '}') closes++;
    }
    const delta = opens - closes;
    if (delta !== 0) {
      console.log('+ (' + delta + '): ' + content.substring(0, 100));
    }
    net += delta;
  } else if (line.startsWith('-') && !line.startsWith('---')) {
    const content = line.slice(1);
    let opens = 0, closes = 0;
    for (const ch of content) {
      if (ch === '{') opens++;
      if (ch === '}') closes++;
    }
    const delta = opens - closes;
    if (delta !== 0) {
      console.log('- (' + (-delta) + '): ' + content.substring(0, 100));
    }
    net -= delta;
  }
}
console.log('Net: ' + net);
