import {readFileSync as read,writeFileSync as write} from 'node:fs';
let html=read('dist/index.html','utf8');
const anchor='<div class="form-grid basic-grid"><label>Nature';
if(!html.includes(anchor))throw Error('Missing editor level insertion anchor');
html=html.replace(anchor,'<div class="form-grid basic-grid"><label>Level<input id="level" name="level" type="number" min="1" max="100" inputmode="numeric"></label><label>Nature');
write('dist/index.html',html);
let js=read('dist/main.js','utf8');
const edits=[
 ["$('editor').hidden=false;","$('editor').hidden=false;$('level').value=String(mon.level);"],
 ['return{species,ability:',"return{species,level:readInt('level',1,100),ability:"],
 ['if(speciesChanged){updatePartySpecies(next,index,{species_id:values.species});updatePartyLevel(next,index,{target_level:before.level});}', 'if(speciesChanged)updatePartySpecies(next,index,{species_id:values.species});if(speciesChanged||values.level!==before.level)updatePartyLevel(next,index,{target_level:values.level});'],
 ['exp:speciesChanged?expAtLevelForSpecies(values.species,before.level):undefined','exp:(speciesChanged||values.level!==before.level)?expAtLevelForSpecies(values.species,values.level):undefined'],
 ['if(!rb||Number(rb.species_id)', 'if(!rb||rb.level!==values.level||Number(rb.species_id)']
];
for(const[a,b]of edits){if(!js.includes(a))throw Error('Missing level edit anchor '+a);js=js.replace(a,b)}
write('dist/main.js',js);
