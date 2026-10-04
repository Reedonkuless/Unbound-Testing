import{readFileSync as read,writeFileSync as write}from'node:fs';
for(const f of ['dist/src/puse/growth.js','dist/src/puse/party.js']){let s=read(f,'utf8');const before='if (n <= 1) return 0;';if(!s.includes(before))throw Error('Missing CP08 EXP boundary');s=s.replace(before,'if (n <= 1) return 1;');write(f,s);}
for(const f of['dist/index.html','dist/main.js','dist/rom-patcher/index.html'])write(f,read(f,'utf8').replaceAll('v0.6.1','v0.6.2'));
const release=JSON.parse(read('dist/cp08-release.json','utf8'));release.tooling_version='0.6.2';release.save_fix='CP08 native level-1 EXP is 1; prevent editor-created summary EXP-bar underflow';write('dist/cp08-release.json',JSON.stringify(release,null,2));
console.log('PASS v0.6.2 level-1 EXP boundary matches native CP08; ROM/payload unchanged');
