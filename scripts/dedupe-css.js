const fs = require('fs');
const path = require('path');
const cssPath = path.resolve(process.cwd(), 'client', 'app', 'globals.css');
const raw = fs.readFileSync(cssPath, 'utf8');

function parseNodes(str) {
  const nodes = [];
  let pos = 0;
  const len = str.length;

  function readComment() {
    const start = pos;
    pos += 2; // skip /*
    while (pos < len && !(str[pos] === '*' && str[pos + 1] === '/')) pos++;
    pos += 2;
    return { type: 'comment', text: str.slice(start, pos) };
  }

  function readString(quote) {
    const start = pos;
    pos++;
    while (pos < len) {
      if (str[pos] === '\\') {
        pos += 2;
        continue;
      }
      if (str[pos] === quote) {
        pos++;
        break;
      }
      pos++;
    }
    return str.slice(start, pos);
  }

  function parseRule() {
    const selectorStart = pos;
    while (pos < len && str[pos] !== '{') {
      if (str[pos] === '/' && str[pos + 1] === '*') {
        // include comment inside selector area
        pos += 2;
        while (pos < len && !(str[pos] === '*' && str[pos + 1] === '/')) pos++;
        pos += 2;
      } else if (str[pos] === '"' || str[pos] === "'") {
        readString(str[pos]);
      } else {
        pos++;
      }
    }
    if (pos >= len || str[pos] !== '{') return null;
    const selector = str.slice(selectorStart, pos).trim().replace(/\s+/g, ' ');
    const openBrace = pos;
    pos++;
    let depth = 1;
    while (pos < len && depth > 0) {
      if (str[pos] === '/' && str[pos + 1] === '*') {
        pos += 2;
        while (pos < len && !(str[pos] === '*' && str[pos + 1] === '/')) pos++;
        pos += 2;
      } else if (str[pos] === '"' || str[pos] === "'") {
        readString(str[pos]);
      } else if (str[pos] === '{') {
        depth++;
        pos++;
      } else if (str[pos] === '}') {
        depth--;
        pos++;
      } else {
        pos++;
      }
    }
    const content = str.slice(selectorStart, pos);
    return { type: 'rule', selector, content };
  }

  while (pos < len) {
    if (str[pos] === '/' && str[pos + 1] === '*') {
      nodes.push(readComment());
      continue;
    }
    if (str[pos].trim() === '') {
      const start = pos;
      while (pos < len && str[pos].trim() === '') pos++;
      nodes.push({ type: 'text', content: str.slice(start, pos) });
      continue;
    }
    // attempt to parse a rule starting from here
    const rule = parseRule();
    if (rule) {
      nodes.push(rule);
      continue;
    }
    // fallback: consume character
    const start = pos;
    pos++;
    nodes.push({ type: 'text', content: str.slice(start, pos) });
  }
  return nodes;
}

function dedupeNodes(nodes) {
  const selectorMap = new Map();
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.type === 'rule') {
      const key = node.selector;
      selectorMap.set(key, i);
    }
  }
  const deduped = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.type === 'rule') {
      const keepIndex = selectorMap.get(node.selector);
      if (keepIndex !== i) continue;
      if (node.selector.startsWith('@') && node.content.includes('{')) {
        const inner = node.content.slice(node.content.indexOf('{') + 1, node.content.lastIndexOf('}'));
        const innerNodes = parseNodes(inner);
        const dedupedInner = dedupeNodes(innerNodes);
        const prefix = node.content.slice(0, node.content.indexOf('{') + 1);
        const suffix = '}';
        node.content = prefix + dedupedInner.map(n => n.content ?? n.text).join('') + suffix;
      }
    }
    deduped.push(node);
  }
  return deduped;
}

const parsed = parseNodes(raw);
const deduped = dedupeNodes(parsed);
const dedupedText = deduped.map(node => node.content ?? node.text).join('');
const headersRemoved = raw.length - dedupedText.length;

fs.writeFileSync(cssPath, dedupedText, 'utf8');

console.log(`Parsed nodes: ${parsed.length}`);
console.log(`Deduped nodes: ${deduped.length}`);
console.log(`Output length: ${dedupedText.length}`);
console.log(`Length delta: ${headersRemoved}`);
