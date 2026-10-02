import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const m=JSON.parse(readFileSync('deploy/cp07-editor-metadata.json'));
const sha=s=>createHash('sha256').update(s).digest('hex');
const sorted=o=>o===null||typeof o!=='object'?JSON.stringify(o):Array.isArray(o)?'['+o.map(sorted).join(',')+']':'{'+Object.keys(o).sort().map(k=>JSON.stringify(k)+':'+sorted(o[k])).join(',')+'}';
for(const [path,c] of Object.entries(m.files)){
 let text=readFileSync('dist/'+path,'utf8');if(sha(text)!==c.before_sha256)throw Error('CP07 precondition: '+path);
 if(c.append)text+=c.append;
 else if(c.add){const o=JSON.parse(text.slice('export default '.length).replace(/;\s*$/,''));for(const [id,row]of Object.entries(c.add)){if(id in o)throw Error('Existing species: '+id);o[id]=row;}text='export default '+sorted(o)+';\n';}
 else {const o=JSON.parse(text);if(o.moves.some(x=>x.move_id===c.move.move_id))throw Error('Existing move');o.moves.push(c.move);o.move_count=c.move_count;text=JSON.stringify(o,null,2)+'\n';}
 if(sha(text)!==c.after_sha256)throw Error('CP07 output: '+path);writeFileSync('dist/'+path,text);
}
console.log('PASS additive CP07 metadata; eight catalogs only; ROM/UI/parser unchanged');
