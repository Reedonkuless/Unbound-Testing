import{execFileSync}from'node:child_process';for(const script of['build-v061.mjs','patch-summary-exp-v062.mjs'])execFileSync(process.execPath,['deploy/'+script],{stdio:'inherit'});
