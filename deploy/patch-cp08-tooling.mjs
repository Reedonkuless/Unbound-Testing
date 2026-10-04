import {readFileSync as read,writeFileSync as write,copyFileSync as copy} from 'node:fs';
const release=JSON.parse(read('deploy/cp08-release.json','utf8'));
const ns=JSON.parse(read('deploy/cp08-namespace.json','utf8'));
function edit(file,fn){write(file,fn(read(file,'utf8')))}
function replace(text,old,value){if(!text.includes(old))throw Error('Missing build anchor '+old);return text.replaceAll(old,value)}
copy('deploy/'+release.payload.filename,'dist/rom-patcher/'+release.payload.filename);
for(const name of ['cp08-release.json','cp08-namespace.json'])copy('deploy/'+name,'dist/'+name);
edit('dist/rom-patcher/index.html',text=>{
 const pairs=[['705bf4e8fc5ac80a9790d99f76acecd90743ccbd',release.target.sha1],['2d059a184bb1a04beb8c8ce9627697f4ff4904e07dc2f147ebeb7b8bf7fdfb8b',release.target.sha256],['182f8164a374fcd4780bb7a52c83542cd6972b1ea0989269525f0ee0c688507f',release.payload.sha256],['Unbound_Latest_Recovered_CP33_GrimbleEyeFix_2026-09-27.upf?v=1',release.payload.filename],['Pokemon Unbound - Recovered CP33 Grimble Eye Fix.gba',release.target.filename],['Recovered CP33','CP08'],['RECOVERED CP33 · GRIMBLE EYE FIX · iOS INLINE BUILD','CP08 · EXACT ACCEPTED GAMEPLAY BASELINE'],['recovered CP33','CP08'],[' with the corrected Dreadchomp live party-icon mapping and finalized Grimble back-sprite eye fix','']];
 for(const [a,b]of pairs)text=replace(text,a,b);
 text=replace(text,'<p class="hash-note">','<p class="hash-note">Supported source: Pokémon Unbound v2.1.1.1<br>Source SHA-1:<br><code>'+release.source.sha1+'</code><br>Source SHA-256:<br><code>'+release.source.sha256+'</code><br>');
 text=replace(text,'</a>\n</div>','</a>\n  <button id="share-rom" class="secondary-button" type="button" hidden>Share / Save to Files</button>\n</div>');
 text=replace(text,'var outputUrl = null;','var outputUrl = null;\n  var outputFile = null;\n  var share = document.getElementById("share-rom");');
 text=replace(text,'download.hidden = true;','outputFile = null;\n    share.hidden = true;\n    download.hidden = true;');
 text=replace(text,"outputUrl = URL.createObjectURL(new Blob([output], { type: 'application/octet-stream' }));","outputFile = new File([output], '"+release.target.filename+"', {type: 'application/octet-stream'});\n      outputUrl = URL.createObjectURL(outputFile);\n      share.hidden = !(navigator.share && navigator.canShare && navigator.canShare({files:[outputFile]}));");
 text=replace(text,"choose.onclick = function () { input.click(); };","share.onclick = function () {\n    if (!outputFile) return;\n    navigator.share({files:[outputFile]}).catch(function(err){\n      setStatus(err.name === 'AbortError' ? 'Sharing cancelled. Download remains available.' : 'File sharing unavailable. Use Download patched ROM.', err.name !== 'AbortError');\n    });\n  };\n  window.addEventListener('pagehide', clearOutput);\n  choose.onclick = function () { input.click(); };");
 return text;
});
for(const [file,rows]of [['pokemon',ns.species],['moves',ns.moves],['items',ns.items]])edit('dist/data/'+file+'.txt',text=>{
 for(const row of rows){const re=new RegExp('^'+row.id+':[^\\n]*','m');if(re.test(text))text=text.replace(re,row.id+':'+row.name);else text+='\n'+row.id+':'+row.name+'\n';}return text;
});
edit('dist/data/move_table_from_rom.json',text=>{const data=JSON.parse(text);for(const row of ns.moves){const entry=data.moves.find(m=>m.move_id===row.id);if(!entry)throw Error('Missing move '+row.id);Object.assign(entry,{name:row.name,base_pp:row.pp});}data.source_rom=release.target.filename;return JSON.stringify(data,null,2)+'\n';});
edit('dist/main.js',text=>{
 text=replace(text,'function download(ext){','function download(ext,shareFile=false){');
 text=replace(text,'const url=URL.createObjectURL(new Blob([output],{type:\'application/octet-stream\'}));',`const file=new File([output],name,{type:'application/octet-stream'});if(shareFile){if(!navigator.share||!navigator.canShare?.({files:[file]})){message('File sharing unavailable. Use Download .sav.');return;}navigator.share({files:[file]}).catch(error=>message(error.name==='AbortError'?'Sharing cancelled. Download remains available.':error.message,true));return;}const url=URL.createObjectURL(file);`);
 text=replace(text,'-v040-unified-edited','-CP08-edited');
 text=replace(text,"$('export-sav').addEventListener('click',()=>download('.sav'));","$('export-sav').addEventListener('click',()=>download('.sav'));$('share-sav').addEventListener('click',()=>download('.sav',true));$('share-sav').hidden=!(navigator.share&&navigator.canShare);");
 return text.replaceAll('v0.5.4','v0.6.0');
});
edit('dist/index.html',text=>replace(text,'<button id="export-sav"','<button id="share-sav" class="secondary-button" type="button" hidden>Share .sav / Save to Files</button><button id="export-sav"').replaceAll('v0.5.4','v0.6.0'));
console.log('PASS CP08 payload and browser file export integration');
write('dist/manifest.webmanifest',JSON.stringify({name:'Unbound Save Studio',short_name:'Unbound',id:'/',start_url:'/',scope:'/',display:'standalone',theme_color:'#102b27',background_color:'#102b27'},null,2));
for(const file of ['dist/index.html','dist/rom-patcher/index.html'])edit(file,text=>replace(text,'</head>','<link rel="manifest" href="/manifest.webmanifest"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Unbound Save Studio">\n</head>'));
edit('dist/index.html',text=>text.replaceAll('Recovered CP33','Accepted CP08').replaceAll('recovered CP33 candidate','accepted CP08 target'));
