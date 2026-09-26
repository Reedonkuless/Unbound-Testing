import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const SRC = 'deploy/Unbound_Latest_Recovered_CP33_DreadchompFix_2026-09-26.upf';
const DST = 'dist/rom-patcher/Unbound_Latest_Recovered_CP33_DreadchompFix_2026-09-26.upf';
const EXPECTED_PAYLOAD_SHA256 = '3372db3661ddefb6b408756658c5f6bbeb903d5c592a894a5a939c76a94fe0de';

const payload = readFileSync(SRC);
const actual = createHash('sha256').update(payload).digest('hex');
if (actual !== EXPECTED_PAYLOAD_SHA256) throw new Error('Dreadchomp UPF integrity mismatch: ' + actual);
copyFileSync(SRC, DST);

const htmlPath = 'dist/rom-patcher/index.html';
let html = readFileSync(htmlPath, 'utf8');
function replaceRequired(from, to) {
  if (!html.includes(from)) throw new Error('Expected patcher fragment not found: ' + from);
  html = html.replaceAll(from, to);
}
replaceRequired('1037b82bd50a4cad4d3fa63316da79f403e0e7d1','4e0a55e7214c63a50e7b1f83069b7c083f6fefdf');
replaceRequired('9c52a435a7159a721bf6fd532fa03e4bb435ddf4956b6a5c6c14a83e92ac288f','bb8212b90500e7e6b580f909531798c50bab31a978b3e5d57de6b574fec0618b');
replaceRequired('82a7887b91db41ff7402cd0c92e1c23ca9e1c0548940ea250fa92a12201ee33e','3372db3661ddefb6b408756658c5f6bbeb903d5c592a894a5a939c76a94fe0de');
replaceRequired('/rom-patcher/Unbound_Latest_Recovered_CP33_2026-09-26.upf?inline-ios=2','/rom-patcher/Unbound_Latest_Recovered_CP33_DreadchompFix_2026-09-26.upf?v=1');
replaceRequired('RECOVERED CP33 · CLEAN BASE · iOS INLINE BUILD','RECOVERED CP33 · DREADCHOMP REINJECT · iOS INLINE BUILD');
replaceRequired('Pokemon Unbound - Latest Recovered CP33.gba','Pokemon Unbound - Recovered CP33 Dreadchomp Fix.gba');
replaceRequired('builds the deterministic recovered CP33 target.','builds the deterministic recovered CP33 Dreadchomp re-injection target.');
writeFileSync(htmlPath, html);

const rootPath='dist/index.html';
let root=readFileSync(rootPath,'utf8').replaceAll('v0.5.1','v0.5.2');
writeFileSync(rootPath,root);
const mainPath='dist/main.js';
let main=readFileSync(mainPath,'utf8').replaceAll('v0.5.1 editor ready.','v0.5.2 editor ready.');
writeFileSync(mainPath,main);

const manifest = {
  format:'UPF1 deterministic binary patch',
  release_state:'Recovered CP33 Dreadchomp dedicated re-injection build',
  input:{name:'Pokemon Unbound (v2.1.1.1).gba',bytes:33554432,sha1:'b4776b82a4c7915d0fadeaa27e013523f99dfd94',sha256:'7aa25bbf568f7cfcf6ee1cf2e9e6ff637350b3d0705c2375cabb6baa7d9739f7'},
  output:{name:'Pokemon Unbound - Recovered CP33 Dreadchomp Fix.gba',bytes:33554432,sha1:'4e0a55e7214c63a50e7b1f83069b7c083f6fefdf',sha256:'bb8212b90500e7e6b580f909531798c50bab31a978b3e5d57de6b574fec0618b'},
  dreadchomp_reinjection:{species_id:1300,approved_source_png_sha256:'aca9931a9c5696e7f76dca96ed6f996b9020bb6187c53da52e3be0ba85f4cfa5',raw_4bpp_sha256:'8c0a2b2f70dff4cb2b493728ff8d2fcb15d7ce7c5782e11a6d5a7b046afc85d8',old_graphics_offset:'0x01FED800',new_graphics_offset:'0x01FEE040',old_pointer:'0x09FED800',new_pointer:'0x09FEE040',palette_index:5},
  patch:{payload:'Unbound_Latest_Recovered_CP33_DreadchompFix_2026-09-26.upf',payload_bytes:517185,payload_sha256:EXPECTED_PAYLOAD_SHA256,record_count:781,physical_changed_bytes:490776,merge_gap_max_bytes:32},
  verification:{independent_applications:3,all_output_hashes_identical:true,relative_to_previous_target_changed_bytes:1026},
  guards:{exact_clean_input_hash_required:true,payload_sha256_required:true,exact_output_hash_required:true,rom_bundled:false}
};
writeFileSync('dist/rom-patcher/Unbound_Dreadchomp_Reinject_Patcher_Manifest_2026-09-26.json',JSON.stringify(manifest,null,2));
console.log('PASS Dreadchomp dedicated re-injection payload + target guards installed');
