#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const editableExts = new Set(['.ts','.tsx','.js','.jsx','.json','.md','.ps1','.html','.css','.scss','.yaml','.yml','.txt','.cjs','.mjs']);

let filesChanged = 0;
let totalReplacements = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      // skip node_modules and .git
      if (ent.name === 'node_modules' || ent.name === '.git') continue;
      walk(full);
    } else if (ent.isFile()) {
      const ext = path.extname(ent.name).toLowerCase();
      if (!editableExts.has(ext)) continue;
      try {
        const content = fs.readFileSync(full, 'utf8');
        const matches = content.split('cielitodeflores').length - 1;
        if (matches > 0) {
          const replaced = content.split('cielitodeflores').join('cielitodeflores');
          fs.writeFileSync(full, replaced, 'utf8');
          filesChanged += 1;
          totalReplacements += matches;
          console.log(`Updated: ${path.relative(root, full)} (${matches} replacements)`);
        }
      } catch (err) {
        console.error(`Failed processing ${full}: ${err.message}`);
      }
    }
  }
}

try {
  walk(root);
  console.log('---');
  console.log(`Files changed: ${filesChanged}`);
  console.log(`Total replacements: ${totalReplacements}`);
} catch (err) {
  console.error('Script failed:', err);
  process.exit(1);
}
