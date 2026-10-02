import { rmSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
function run(cmd,args){execFileSync(cmd,args,{stdio:'inherit'});}
run(process.execPath,['deploy/verify-package.mjs']);
rmSync('dist',{recursive:true,force:true});
mkdirSync('dist',{recursive:true});
run('unzip',['-q','deploy/Unbound_Save_Studio_v0.5.1_Recovered_CP33_CleanBase.zip','-d','dist']);
run(process.execPath,['deploy/patch-index.mjs']);
run(process.execPath,['deploy/patch-editor-mega-forms.mjs']);
run(process.execPath,['deploy/patch-ios-inline-patcher.mjs']);
run(process.execPath,['deploy/patch-dreadchomp-v053.mjs']);
run(process.execPath,['deploy/patch-grimble-v054.mjs']);
run(process.execPath,['deploy/patch-cp07-editor-metadata.mjs']);
console.log('PASS v0.5.4 Grimble eye-fix production build');
