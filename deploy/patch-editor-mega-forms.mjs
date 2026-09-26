import { readFileSync, writeFileSync } from 'node:fs';

const file = 'dist/main.js';
let js = readFileSync(file, 'utf8');

function replaceRequired(from, to) {
  if (!js.includes(from)) throw new Error('Expected Save Studio source fragment not found: ' + from);
  js = js.replace(from, to);
}

replaceRequired(
  '.filter(([id])=>Number(id)>0).map(([id,name])=>',
  '.filter(([id])=>Number(id)>0&&!(Number(id)>=869&&Number(id)<=918)).map(([id,name])=>'
);

replaceRequired(
  'function setSpeciesOptions(select,value){setOptions(select,state.speciesList,value)}',
  "function setSpeciesOptions(select,value){const id=Number(value),entries=[...state.speciesList];if(id>=869&&id<=918&&state.species.has(id))entries.push({id:id,name:(state.species.get(id)||('Species #'+id))+' (Mega/internal) · #'+id});entries.sort((a,b)=>a.id-b.id);setOptions(select,entries,value)}"
);

replaceRequired(
  "message('v0.5.0 CP33 editor ready. Select an Unbound v2.1.1.1 save to begin.');",
  "message('v0.5.1 editor ready. Native Mega/Primal battle forms are hidden from species creation and replacement. Select an Unbound v2.1.1.1 save to begin.');"
);

writeFileSync(file, js);
console.log('PASS Save Studio hides internal Mega/Primal species 869-918');
