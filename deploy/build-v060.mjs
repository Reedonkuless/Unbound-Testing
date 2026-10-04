import {execFileSync} from 'node:child_process';
for(const script of ['build-v054.mjs','patch-cp08-tooling.mjs'])execFileSync(process.execPath,['deploy/'+script],{stdio:'inherit'});
