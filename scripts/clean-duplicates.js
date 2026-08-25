const fs = require('fs');
const path = require('path');

const cssPath = path.resolve('client', 'app', 'globals.css');
let content = fs.readFileSync(cssPath, 'utf8');

// Split into lines for analysis
const lines = content.split('\n');
const seen = new Set();
const output = [];
let inBlock = false;
let blockDepth = 0;
let currentBlock = '';
let blockStartLine = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Track braces
  const openBraces = (line.match(/\{/g) || []).length;
  const closeBraces = (line.match(/\}/g) || []).length;
  
  if (openBraces > 0) inBlock = true;
  blockDepth += openBraces - closeBraces;
  
  if (inBlock) {
    currentBlock += line + '\n';
  } else {
    output.push(line);
  }
  
  if (blockDepth === 0 && inBlock && currentBlock.trim()) {
    inBlock = false;
    
    // Extract selector from block
    const match = currentBlock.match(/^([\s]*[^{]+)\{/);
    if (match) {
      const selector = match[1].trim().replace(/\s+/g, ' ');
      const signature = selector;
      
      if (!seen.has(signature)) {
        seen.add(signature);
        output.push(currentBlock.trimEnd());
      } else {
        console.log(`REMOVED DUPLICATE: ${selector.substring(0, 80)}`);
      }
    }
    currentBlock = '';
  }
}

const result = output.join('\n');
fs.writeFileSync(cssPath, result, 'utf8');

console.log(`\n✓ CSS cleaned`);
console.log(`Original size: ${content.length} bytes`);
console.log(`New size: ${result.length} bytes`);
console.log(`Removed: ${content.length - result.length} bytes`);
console.log(`Selectors kept: ${seen.size}`);
