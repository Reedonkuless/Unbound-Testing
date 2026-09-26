import { readFileSync, writeFileSync } from 'node:fs';

const file = 'dist/index.html';
let html = readFileSync(file, 'utf8');

function replaceRequired(from, to) {
  if (!html.includes(from)) throw new Error(`Expected deployment text not found: ${from}`);
  html = html.replace(from, to);
}

replaceRequired(
  'Pokémon Unbound Save Studio v0.5.0 CP33 editor',
  'Pokémon Unbound Save Studio v0.5.1 Recovered CP33 editor'
);
replaceRequired(
  '<title>Pokémon Unbound Save Studio v0.5.0</title>',
  '<title>Pokémon Unbound Save Studio v0.5.1</title>'
);
replaceRequired(
  'v0.5.0 · CP33 · 2.1.1.1',
  'v0.5.1 · Recovered CP33 · 2.1.1.1'
);
replaceRequired(
  'v0.5.0 CP33 editor build.',
  'v0.5.1 Recovered CP33 editor build.'
);
replaceRequired(
  'The latest CP33 ROM overlay requires the exact CP27 prerequisite; the legacy RC6 clean-base patch remains available separately.',
  'The ROM patcher accepts the exact original Unbound v2.1.1.1 ROM and builds the deterministic recovered CP33 candidate, with source, payload, and final-ROM hashes verified in your browser.'
);

writeFileSync(file, html);
console.log('PASS deployment index normalized to v0.5.1 Recovered CP33');
