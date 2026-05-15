const fs = require('fs');
const code = fs.readFileSync('src/app/tracking/page.tsx', 'utf8');
let openB = 0; let closeB = 0;
for (let i = 0; i < code.length; i++) {
  if (code[i] === '{') openB++;
  if (code[i] === '}') closeB++;
}
console.log('Open:', openB, 'Close:', closeB);
