const fs = require('fs');
const { execSync } = require('child_process');

// Get all diff hunks
const diff = execSync('git diff routes/school.js', { encoding: 'utf8', cwd: 'C:/Users/Twumg/OneDrive/Documents/schoolos-backend/Managen' });

let net = 0;
let currentHunk = '';
let hunkNet = 0;

for (const line of diff.split('\n')) {
  if (line.startsWith('@@')) {
    if (currentHunk) {
      console.log('Hunk starting ' + currentHunk + ': net ' + hunkNet);
    }
    currentHunk = line;
    hunkNet = 0;
  } else if (line.startsWith('+') && !line.startsWith('+++')) {
    const content = line.slice(1);
    let opens = 0, closes = 0;
    for (const ch of content) {
      if (ch === '{') opens++;
      if (ch === '}') closes++;
    }
    hunkNet += (opens - closes);
    net += (opens - closes);
  } else if (line.startsWith('-') && !line.startsWith('---')) {
    const content = line.slice(1);
    let opens = 0, closes = 0;
    for (const ch of content) {
      if (ch === '{') opens++;
      if (ch === '}') closes++;
    }
    hunkNet -= (opens - closes);
    net -= (opens - closes);
  }
}
if (currentHunk) {
  console.log('Hunk starting ' + currentHunk + ': net ' + hunkNet);
}
console.log('Total net: ' + net);
