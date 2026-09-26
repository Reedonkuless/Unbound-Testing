import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const checks = [
  ['deploy/Unbound_Save_Studio_v0.5.1_Recovered_CP33_CleanBase.zip', 'b74766642902cd489c075b2ded1fa37760ba0af7b5ca35b4a9b4e37d17995c60'],
];

for (const [file, expected] of checks) {
  const actual = createHash('sha256').update(readFileSync(file)).digest('hex');
  if (actual !== expected) throw new Error(`Integrity check failed for ${file}: ${actual}`);
  console.log(`PASS ${file} SHA-256 ${actual}`);
}
