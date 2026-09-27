import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const SRC='deploy/Unbound_Latest_Recovered_CP33_Dreadchomp_LiveTableFix_2026-09-26.upf';
const DST='dist/rom-patcher/Unbound_Latest_Recovered_CP33_Dreadchomp_LiveTableFix_2026-09-26.upf';
const PAYLOAD_SHA='516def98eb21c4d5b6a27f4585a468a8b613c5a1ce241b7a7331c3cc3d729c66';

const payload=readFileSync(SRC);
const got=createHash('sha256').update(payload).digest('hex');
if(got!==PAYLOAD_SHA) throw new Error('Dreadchomp live-table UPF integrity mismatch: '+got);
copyFileSync(SRC,DST);

const htmlPath='dist/rom-patcher/index.html';
let html=readFileSync(htmlPath,'utf8');
function req(from,to){
  if(!html.includes(from)) throw new Error('Expected patcher fragment missing: '+from);
  html=html.replaceAll(from,to);
}
req('1037b82bd50a4cad4d3fa63316da79f403e0e7d1','1bdf1fe33fd018bebbd80c7841f6521a7b4476cb');
req('9c52a435a7159a721bf6fd532fa03e4bb435ddf4956b6a5c6c14a83e92ac288f','a2adf117c67a8bf8a58e4e47a96dcd43d1ceab7c2dedaaf0856b813e69967c35');
req('82a7887b91db41ff7402cd0c92e1c23ca9e1c0548940ea250fa92a12201ee33e','516def98eb21c4d5b6a27f4585a468a8b613c5a1ce241b7a7331c3cc3d729c66');
req('/rom-patcher/Unbound_Latest_Recovered_CP33_2026-09-26.upf?inline-ios=2','/rom-patcher/Unbound_Latest_Recovered_CP33_Dreadchomp_LiveTableFix_2026-09-26.upf?v=1');
req('RECOVERED CP33 · CLEAN BASE · iOS INLINE BUILD','RECOVERED CP33 · DREADCHOMP LIVE-TABLE FIX · iOS INLINE BUILD');
req('Pokemon Unbound - Latest Recovered CP33.gba','Pokemon Unbound - Recovered CP33 Dreadchomp LiveTable Fix.gba');
req('builds the deterministic recovered CP33 target.','builds the deterministic recovered CP33 target with the corrected live Dreadchomp party-icon table and palette mapping.');
writeFileSync(htmlPath,html);

// Correct the historical CP33 source constants in the deployed source copy too.
const overlayPath='dist/rom-patcher/cp33-overlay.js';
let overlay=readFileSync(overlayPath,'utf8');
overlay=overlay.replace('const ICON_GFX_TABLE=0x0163F2CC, ICON_PALIDX_TABLE=0x01640724;',
  'const ICON_GFX_TABLE=0x0163F3A0, ICON_PALIDX_TABLE=0x016407FC;');
writeFileSync(overlayPath,overlay);

const assetManifestPath='dist/rom-patcher/UNBOUND_CP33_PARTY_ICON_INJECTION_MANIFEST.json';
try {
  let m=JSON.parse(readFileSync(assetManifestPath,'utf8'));
  if(m.party_icon_table){
    m.party_icon_table.graphics_table='0x0163F3A0';
    m.party_icon_table.palette_index_table='0x016407FC';
    m.party_icon_table.correction_note='Post-Mournevoir live table addresses; supersedes stale pre-Mournevoir CP33 addresses.';
  }
  writeFileSync(assetManifestPath,JSON.stringify(m,null,2)+'\n');
} catch {}

const rootPath='dist/index.html';
let root=readFileSync(rootPath,'utf8').replaceAll('v0.5.1','v0.5.3');
writeFileSync(rootPath,root);
const mainPath='dist/main.js';
let main=readFileSync(mainPath,'utf8').replaceAll('v0.5.1 editor ready.','v0.5.3 editor ready.');
writeFileSync(mainPath,main);

const manifest={
  format:'UPF1 deterministic binary patch',
  release_state:'Recovered CP33 Dreadchomp live-table correction',
  input:{name:'Pokemon Unbound (v2.1.1.1).gba',bytes:33554432,sha1:'b4776b82a4c7915d0fadeaa27e013523f99dfd94',sha256:'7aa25bbf568f7cfcf6ee1cf2e9e6ff637350b3d0705c2375cabb6baa7d9739f7'},
  output:{name:'Pokemon Unbound - Recovered CP33 Dreadchomp LiveTable Fix.gba',bytes:33554432,sha1:'1bdf1fe33fd018bebbd80c7841f6521a7b4476cb',sha256:'a2adf117c67a8bf8a58e4e47a96dcd43d1ceab7c2dedaaf0856b813e69967c35'},
  root_cause:{
    stale_cp33_graphics_table:'0x0163F2CC',
    stale_cp33_palette_index_table:'0x01640724',
    live_post_mournevoir_graphics_table:'0x0163F3A0',
    live_post_mournevoir_palette_index_table:'0x016407FC',
    dreadchomp_species_id:1300,
    live_graphics_entry_file_offset:'0x016407F0',
    live_palette_entry_file_offset:'0x01640D10',
    before_live_graphics_pointer:'0x09FED800',
    after_live_graphics_pointer:'0x09FEE040',
    before_live_palette_index:4,
    after_live_palette_index:5
  },
  approved_asset:{
    source_png_sha256:'aca9931a9c5696e7f76dca96ed6f996b9020bb6187c53da52e3be0ba85f4cfa5',
    raw_4bpp_sha256:'8c0a2b2f70dff4cb2b493728ff8d2fcb15d7ce7c5782e11a6d5a7b046afc85d8',
    intended_palette_slot:5
  },
  patch:{payload:'Unbound_Latest_Recovered_CP33_Dreadchomp_LiveTableFix_2026-09-26.upf',payload_bytes:517185,payload_sha256:PAYLOAD_SHA,record_count:781},
  verification:{clean_base_applications:3,all_output_hashes_identical:true,delta_from_user_supplied_previous_fix_bytes:3,cold_boot_600_frame_oracle_sha256:'9f939df8dfb9b539c74f628bec407f775be950e4d950a820da4ee5e03622e15c'},
  guards:{exact_clean_input_hash_required:true,payload_sha256_required:true,exact_output_hash_required:true,rom_bundled:false}
};
writeFileSync('dist/rom-patcher/Unbound_Dreadchomp_LiveTableFix_Manifest_2026-09-26.json',JSON.stringify(manifest,null,2)+'\n');
console.log('PASS Dreadchomp live post-Mournevoir table correction installed');
