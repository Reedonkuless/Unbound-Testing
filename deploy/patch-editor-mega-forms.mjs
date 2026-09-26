import { readFileSync, writeFileSync } from 'node:fs';

const file = 'dist/main.js';
let js = readFileSync(file, 'utf8');

function replaceRequired(from, to) {
  if (!js.includes(from)) throw new Error('Expected Save Studio source fragment not found');
  js = js.replace(from, to);
}

replaceRequired(
  "function buildSpeciesList(){state.speciesList=[...state.species.entries()].filter(([id])=>Number(id)>0).map(([id,name])=>({id:Number(id),name:\`${name} · #${id}\`})).sort((a,b)=>a.id-b.id)}\nfunction setSpeciesOptions(select,value){setOptions(select,state.speciesList,value)}",
  "const INTERNAL_MEGA_SPECIES_MIN=869;\nconst INTERNAL_MEGA_SPECIES_MAX=918;\nfunction isInternalMegaSpecies(id){const n=Number(id);return Number.isInteger(n)&&n>=INTERNAL_MEGA_SPECIES_MIN&&n<=INTERNAL_MEGA_SPECIES_MAX}\nfunction buildSpeciesList(){state.speciesList=[...state.species.entries()].filter(([id])=>Number(id)>0&&!isInternalMegaSpecies(id)).map(([id,name])=>({id:Number(id),name:\`${name} · #${id}\`})).sort((a,b)=>a.id-b.id)}\nfunction setSpeciesOptions(select,value){const id=Number(value);const entries=[...state.speciesList];if(isInternalMegaSpecies(id)&&state.species.has(id))entries.push({id,name:\`${speciesName(id)} (Mega/internal) · #${id}\`});entries.sort((a,b)=>a.id-b.id);setOptions(select,entries,value)}"
);

replaceRequired(
  "message('v0.5.0 CP33 editor ready. Select an Unbound v2.1.1.1 save to begin.');",
  "message('v0.5.1 editor ready. Native Mega/Primal battle forms are hidden from species creation and replacement. Select an Unbound v2.1.1.1 save to begin.');"
);

writeFileSync(file, js);
console.log('PASS Save Studio hides internal Mega/Primal species 869-918');
