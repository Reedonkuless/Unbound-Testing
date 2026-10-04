import {readFileSync as read,writeFileSync as write,mkdirSync,copyFileSync as copy} from 'node:fs';
function edit(f,fn){write(f,fn(read(f,'utf8')))}
function replace(s,a,b){if(!s.includes(a))throw Error('Missing mobile anchor '+a.slice(0,70));return s.replaceAll(a,b)}
const ns=JSON.parse(read('deploy/cp08-namespace.json','utf8'));
write('dist/src/puse/cp08Types.json.js','export default '+JSON.stringify(Object.fromEntries(ns.species.map(s=>[s.id,s.types])))+';\n');
copy('deploy/ios-assets/mobile.css','dist/mobile.css');mkdirSync('dist/icons',{recursive:true});for(const n of [180,192,512])copy('deploy/ios-assets/icon-'+n+'.png','dist/icons/icon-'+n+'.png');
for(const f of ['dist/index.html','dist/rom-patcher/index.html'])edit(f,s=>replace(s,'</head>','<link rel="stylesheet" href="/mobile.css"><link rel="apple-touch-icon" href="/icons/icon-180.png">\n</head>').replaceAll('v0.6.0','v0.6.1'));
edit('dist/index.html',s=>{
 s=replace(s,'<h1 id="page-title">Build the party you want.</h1>','<h1 id="page-title">Edit your Unbound save.</h1>');
 s=replace(s,"Edit an owned Pokémon's species or create a new Pokémon directly in your Party or an empty PC slot, then export a checksum-corrected copy.",'Open your save from Files, edit your party or PC, and export a copy for Delta or your desktop emulator.');
 s=replace(s,'v0.6.1 · Accepted CP08 · 2.1.1.1','v0.6.1 · CP08');
 s=replace(s,'Tap to select a .sav or .srm','Choose save from Files');
 s=replace(s,'<p class="file-caption" id="file-caption">','<details class="workflow-help"><summary>Using Delta on iPhone</summary><ol><li>In Delta, open the game’s menu and export its in-game save to Files.</li><li>Open that file here, edit your Pokémon, then apply your changes.</li><li>Export .sav and choose Save to Files. Import that save into the same game in Delta.</li></ol><p>Use an in-game save, rather than a save state. The original file stays intact.</p></details><p class="file-caption" id="file-caption">');
 s=replace(s,'<p id="editor-location"></p>','<p id="editor-location"></p><p id="species-details" class="species-details"></p>');
 s=replace(s,'<fieldset><legend>IVs','<details class="stats-details"><summary>IVs and EVs <span>Advanced stats</span></summary><fieldset><legend>IVs');
 s=replace(s,'<div id="ev-grid" class="stat-grid"></div></fieldset>','<div id="ev-grid" class="stat-grid"></div></fieldset></details>');
 s=replace(s,'Save Pokémon changes</button>','Apply changes</button><span id="editor-feedback" role="status" aria-live="polite"></span>');
 s=replace(s,'Ready to play?','Export your save');
 s=replace(s,'Download a new file. Keep your original as a backup before replacing the emulator’s save.','Use Share / Save to Files on iPhone, or download the .sav file. Then import the copy into your emulator.');
 s=replace(s,'id="share-sav" class="secondary-button"','id="share-sav" class="primary-button"');
 s=replace(s,'<button id="export-srm" class="secondary-button" type="button">Download .srm</button>','<details class="alternate-export"><summary>Other save format</summary><button id="export-srm" class="secondary-button" type="button">Download .srm</button></details>');
 return s;
});
edit('dist/main.js',s=>{
 s="import cp08Types from './src/puse/cp08Types.json.js';\n"+s;
 s=replace(s,"$('status').classList.toggle('error',error)","$('status').classList.toggle('error',error);const feedback=$('editor-feedback');if(feedback){feedback.textContent=text;feedback.classList.toggle('error',error)}");
 s=replace(s,"$('editor-name').textContent=mon.species_label", "$('species-details').textContent=[cp08Types[String(mon.species_id)]?.join(' / '),`Level ${mon.level}`].filter(Boolean).join(' · ');$('editor-name').textContent=mon.species_label");
 s=replace(s,'function download(ext,shareFile=false){if(!state.bytes)return;try{',"function download(ext,shareFile=false){if(!state.bytes)return;if(state.formDirty){message('Apply your Pokémon changes before exporting.',true);$('apply-edit').focus({preventScroll:true});return;}try{");
 s=replace(s,"error.name==='AbortError'?'Sharing cancelled. Download remains available.':error.message,true","error.name==='AbortError'?'Sharing cancelled. Download remains available.':'Sharing unavailable. Use Download .sav.',error.name!=='AbortError'");
 s=replace(s,"message('Save loaded. Edit an existing Pokémon or use Add Pokémon.');","$('share-sav').hidden=!(navigator.share&&navigator.canShare&&navigator.canShare({files:[new File([bytes],'unbound.sav',{type:'application/octet-stream'})]}));message('Save loaded. Select a Pokémon to edit, or add one.');");
 s=replace(s,"$('editor').addEventListener('change',()=>{state.formDirty=true});$('editor').addEventListener('input',()=>{state.formDirty=true});","for(const event of ['change','input'])$('editor').addEventListener(event,e=>{if(e.target.matches('.search-field'))return;state.formDirty=true;$('editor-feedback').textContent='Changes not yet applied.';});");
 s=replace(s,"$('share-sav').hidden=!(navigator.share&&navigator.canShare);","$('share-sav').hidden=true;");
 s=replace(s,"'Pokémon changes saved in this session.'","'Changes applied. Export your save to use them in-game.'");
 return s.replaceAll('v0.6.0','v0.6.1');
});
edit('dist/rom-patcher/index.html',s=>{
 s=replace(s,'function readFile(file) {',"function hashes(bytes) {return digest(bytes, 'SHA-1').then(function(h1){return digest(bytes, 'SHA-256').then(function(h2){return [h1,h2];});});}\n  function readFile(file) {");
 s=replace(s,"Promise.all([digest(source, 'SHA-1'), digest(source, 'SHA-256')])",'hashes(source)');
 s=replace(s,"Promise.all([digest(output, 'SHA-1'), digest(output, 'SHA-256')])",'hashes(output)');
 s=replace(s,"return digest(payload, 'SHA-256');","setStatus('Source verified: Unbound v2.1.1.1. Applying CP08…');\n      return digest(payload, 'SHA-256');");
 s=replace(s,'choose.disabled = true;','choose.disabled = true;\n    input.disabled = true;');
 s=replace(s,'choose.disabled = false;','choose.disabled = false;\n      input.disabled = false;');
 s=replace(s,"window.addEventListener('pagehide', clearOutput);","window.addEventListener('pagehide', function(e){if(!e.persisted)clearOutput();});");
 s=replace(s,'Save to Files</button>','Save to Files</button><p class="file-note" id="file-note" hidden></p>');
 s=replace(s,'download.hidden = false;',"download.hidden = false;\n      document.getElementById('file-note').textContent = outputFile.name + ' · 33,554,432 bytes · CP08 verified';\n      document.getElementById('file-note').hidden = false;");
 s=replace(s,'share.hidden = true;',"share.hidden = true;\n    document.getElementById('file-note').hidden = true;");
 s=replace(s,'PASS — patched ROM generated and hash-verified. Tap Download patched ROM.','PASS — CP08 is ready. Share / Save to Files, or download the .gba.');
 return s;
});
const manifest=JSON.parse(read('dist/manifest.webmanifest','utf8'));manifest.icons=[192,512].map(n=>({src:'/icons/icon-'+n+'.png',sizes:n+'x'+n,type:'image/png',purpose:'any maskable'}));write('dist/manifest.webmanifest',JSON.stringify(manifest,null,2));
const release=JSON.parse(read('dist/cp08-release.json','utf8'));release.tooling_version='0.6.1';release.platform_workflow='Browser Files input, File share when supported, Blob download fallback; standalone online app';write('dist/cp08-release.json',JSON.stringify(release,null,2));
console.log('PASS v0.6.1 iPhone layout, export guard and sequential ROM digests; parser/data/ROM unchanged');
