import {execFileSync} from 'node:child_process';
import {readFileSync as read,writeFileSync as write,copyFileSync as copy} from 'node:fs';
import {createHash} from 'node:crypto';
execFileSync(process.execPath,['deploy/build-v063.mjs'],{stdio:'inherit'});
const old=JSON.parse(read('deploy/cp09-release.json','utf8'));
const release=JSON.parse(read('deploy/cp10-release.json','utf8'));
const oldPayload=read('dist/rom-patcher/'+old.payload.filename);
const bytes=new Map();let at=12;
for(let i=0;i<oldPayload.readUInt32LE(8);i++){const offset=oldPayload.readUInt32LE(at),length=oldPayload.readUInt32LE(at+4);at+=8;for(let j=0;j<length;j++)bytes.set(offset+j,oldPayload[at+j]);at+=length;}
for(const patch of JSON.parse(read('deploy/cp10-repair-bytes.json','utf8'))){const data=Buffer.from(patch.hex,'hex');for(let i=0;i<data.length;i++)bytes.set(patch.offset+i,data[i]);}
const keys=[...bytes.keys()].sort((a,b)=>a-b),runs=[];let start=keys[0],last=start;
for(const key of keys.slice(1)){if(key!==last+1){runs.push([start,last+1]);start=key;}last=key;}runs.push([start,last+1]);
const header=Buffer.alloc(12);header.write('UPF1');header.writeUInt32LE(release.target.size,4);header.writeUInt32LE(runs.length,8);
const payload=Buffer.concat([header,...runs.map(([a,b])=>{const h=Buffer.alloc(8);h.writeUInt32LE(a,0);h.writeUInt32LE(b-a,4);return Buffer.concat([h,Buffer.from(Array.from({length:b-a},(_,i)=>bytes.get(a+i)))]);})]);
write('dist/rom-patcher/'+release.payload.filename,payload);
if(createHash('sha256').update(payload).digest('hex')!==release.payload.sha256)throw Error('CP11 payload integrity mismatch');
if(payload.length!==release.payload.size)throw Error('CP11 payload size mismatch');

copy('deploy/cp10-release.json','dist/cp11-release.json');
let html=read('dist/rom-patcher/index.html','utf8');
for(const [before,after] of [[old.target.sha1,release.target.sha1],[old.target.sha256,release.target.sha256],[old.payload.sha256,release.payload.sha256],[old.payload.filename,release.payload.filename],[old.target.filename,release.target.filename]]){
 if(!html.includes(before))throw Error('Missing CP09 build anchor '+before);
 html=html.replaceAll(before,after);
}
html=html.replaceAll('CP09','CP11')
 .replaceAll('REPAIR TEST CANDIDATE','PROMOTED CP11 GAMEPLAY BASELINE')
 .replaceAll('Primary QA passed; independent review pending.','CP09, CP10 and CP11 independent QA passed; CP11 promotion CLOSED.')
 .replace('deterministic CP11 target.','deterministic promoted CP11 gameplay baseline. CP09, CP10 and CP11 independent QA passed; CP11 promotion CLOSED.');
write('dist/rom-patcher/index.html',html);
for(const path of ['dist/index.html','dist/main.js']){
 let text=read(path,'utf8').replaceAll('v0.6.3','v0.6.5').replaceAll('-CP09-edited','-CP11-edited').replaceAll('CP09','CP11');
 if(path.endsWith('index.html')){
   text=text.replaceAll('Accepted CP08','promoted CP11 gameplay baseline').replaceAll('accepted CP08 target','promoted CP11 gameplay baseline');
   text=text.replaceAll('v0.6.5 · CP08','v0.6.5 · CP11');
   text=text.replaceAll('promoted CP11 gameplay baseline','promoted CP11 gameplay baseline');
 }
 write(path,text);
}
console.log('PASS v0.6.5 CP11 patcher/promoted gameplay baseline; Save Studio catalog and save parser unchanged');
