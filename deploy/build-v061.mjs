import {execFileSync} from 'node:child_process';
for(const script of ['build-v060.mjs','patch-ios-v061.mjs'])execFileSync(process.execPath,['deploy/'+script],{stdio:'inherit'});
