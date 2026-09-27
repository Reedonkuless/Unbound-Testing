import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const ZIP='deploy/Unbound_Grimble_Back_Eye_Fix_Patch_2026-09-27.zip';
const ZIP_SHA='1abb2f624189c0c3f076f06ad6db28cd681b6ce59ffef40842ce5de34195c268';
const PAYLOAD_NAME='Unbound_Latest_Recovered_CP33_GrimbleEyeFix_2026-09-27.upf';
const PAYLOAD_SHA='182f8164a374fcd4780bb7a52c83542cd6972b1ea0989269525f0ee0c688507f';
const DST='dist/rom-patcher/'+PAYLOAD_NAME;

function sha256(buf){return createHash('sha256').update(buf).digest('hex');}
const zip=readFileSync(ZIP);
if(sha256(zip)!==ZIP_SHA) throw new Error('Grimble eye-fix package integrity mismatch');
const payload=execFileSync('unzip',['-p',ZIP,PAYLOAD_NAME],{maxBuffer:2*1024*1024});
if(sha256(payload)!==PAYLOAD_SHA) throw new Error('Grimble eye-fix UPF integrity mismatch');
writeFileSync(DST,payload);

const htmlPath='dist/rom-patcher/index.html';
let html=readFileSync(htmlPath,'utf8');
function req(from,to){
  if(!html.includes(from)) throw new Error('Expected patcher fragment missing: '+from);
  html=html.replaceAll(from,to);
}
req('1bdf1fe33fd018bebbd80c7841f6521a7b4476cb','705bf4e8fc5ac80a9790d99f76acecd90743ccbd');
req('a2adf117c67a8bf8a58e4e47a96dcd43d1ceab7c2dedaaf0856b813e69967c35','2d059a184bb1a04beb8c8ce9627697f4ff4904e07dc2f147ebeb7b8bf7fdfb8b');
req('516def98eb21c4d5b6a27f4585a468a8b613c5a1ce241b7a7331c3cc3d729c66','182f8164a374fcd4780bb7a52c83542cd6972b1ea0989269525f0ee0c688507f');
req('/rom-patcher/Unbound_Latest_Recovered_CP33_Dreadchomp_LiveTableFix_2026-09-26.upf?v=1','/rom-patcher/Unbound_Latest_Recovered_CP33_GrimbleEyeFix_2026-09-27.upf?v=1');
req('RECOVERED CP33 · DREADCHOMP LIVE-TABLE FIX · iOS INLINE BUILD','RECOVERED CP33 · GRIMBLE EYE FIX · iOS INLINE BUILD');
req('Pokemon Unbound - Recovered CP33 Dreadchomp LiveTable Fix.gba','Pokemon Unbound - Recovered CP33 Grimble Eye Fix.gba');
req('builds the deterministic recovered CP33 target with the corrected live Dreadchomp party-icon table and palette mapping.','builds the deterministic recovered CP33 target with the corrected Dreadchomp live party-icon mapping and finalized Grimble back-sprite eye fix.');
writeFileSync(htmlPath,html);

const rootPath='dist/index.html';
let root=readFileSync(rootPath,'utf8').replaceAll('v0.5.3','v0.5.4');
writeFileSync(rootPath,root);
const mainPath='dist/main.js';
let main=readFileSync(mainPath,'utf8').replaceAll('v0.5.3 editor ready.','v0.5.4 editor ready.');
writeFileSync(mainPath,main);

const manifest={
  format:'UPF1 deterministic binary patch',
  release_state:'Recovered CP33 with Dreadchomp live-table correction + finalized Grimble back eye fix',
  input:{name:'Pokemon Unbound (v2.1.1.1).gba',bytes:33554432,sha1:'b4776b82a4c7915d0fadeaa27e013523f99dfd94',sha256:'7aa25bbf568f7cfcf6ee1cf2e9e6ff637350b3d0705c2375cabb6baa7d9739f7'},
  output:{name:'Pokemon Unbound - Recovered CP33 Grimble Eye Fix.gba',bytes:33554432,sha1:'705bf4e8fc5ac80a9790d99f76acecd90743ccbd',sha256:'2d059a184bb1a04beb8c8ce9627697f4ff4904e07dc2f147ebeb7b8bf7fdfb8b'},
  grimble_back_fix:{
    species_id:1298,
    source_png:'grimble_back_indexed_64x64.png',
    source_png_sha256:'153fb768703ce70db93f72e126797c15c133df0ddf5d73620297562085a845a4',
    live_back_pic_table:'0x01633C64',
    grimble_entry:'0x016364F4',
    compressed_asset_offset:'0x01FE7568',
    compressed_asset_pointer:'0x09FE7568',
    mapped_raw_4bpp_sha256:'7b9f78ffcbe88f1162cb15cf2ebb4dbd688fa632f7ce13478c82f7c3c8976f4d',
    bytes_changed_vs_v053:26,
    base_gible_unchanged:true
  },
  dreadchomp_live_table_fix_preserved:true,
  patch:{payload:PAYLOAD_NAME,payload_bytes:517185,payload_sha256:PAYLOAD_SHA,record_count:781,clean_base_applications:3},
  verification:{all_output_hashes_identical:true,cold_boot_600_frame_oracle_sha256:'9f939df8dfb9b539c74f628bec407f775be950e4d950a820da4ee5e03622e15c'},
  guards:{exact_clean_input_hash_required:true,payload_sha256_required:true,exact_output_hash_required:true,rom_bundled:false}
};
writeFileSync('dist/rom-patcher/Unbound_Grimble_EyeFix_Manifest_2026-09-27.json',JSON.stringify(manifest,null,2)+'\n');
console.log('PASS Grimble back-eye fix payload + target guards installed');
