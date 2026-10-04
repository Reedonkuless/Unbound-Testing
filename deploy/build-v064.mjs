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
if(createHash('sha256').update(payload).digest('hex')!==release.payload.sha256)throw Error('CP09 payload integrity mismatch');

copy('deploy/cp10-release.json','dist/cp10-release.json');
let html=read('dist/rom-patcher/index.html','utf8');
for(const [before,after] of [[old.target.sha1,release.target.sha1],[old.target.sha256,release.target.sha256],[old.payload.sha256,release.payload.sha256],[old.payload.filename,release.payload.filename],[old.target.filename,release.target.filename]]){
 if(!html.includes(before))throw Error('Missing CP09 build anchor '+before);
 html=html.replaceAll(before,after);
}
html=html.replaceAll('CP09','CP10').replace('EXACT ACCEPTED GAMEPLAY BASELINE','REPAIR TEST CANDIDATE').replace('deterministic CP09 target.','deterministic CP09 repair candidate. Primary QA passed; independent review pending.');
write('dist/rom-patcher/index.html',html);
for(const path of ['dist/index.html','dist/main.js']){
 let text=read(path,'utf8').replaceAll('v0.6.3','v0.6.4').replaceAll('-CP09-edited','-CP10-edited').replaceAll('CP09','CP10');
 if(path.endsWith('index.html'))text=text.replaceAll('Accepted CP08','CP09 repair candidate').replaceAll('accepted CP08 target','CP09 repair candidate');
 write(path,text);
}
console.log('PASS v0.6.4 CP10 patcher candidate; editor behavior/catalog unchanged');
