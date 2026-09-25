// Browser applicator for the exact frozen unified ROM-side payload. No ROM bytes are bundled.
export const ROM_SIZE = 0x2000000;
export const SOURCE_SHA1 = 'b4776b82a4c7915d0fadeaa27e013523f99dfd94';
export const SOURCE_SHA256 = '7aa25bbf568f7cfcf6ee1cf2e9e6ff637350b3d0705c2375cabb6baa7d9739f7';
export const TARGET_SHA1 = '15b818eb3b6028100cc7eebc68e72a44bf96f7af';
export const TARGET_SHA256 = 'fcefa1341858363be236e57cd4b1bfcd725dc4ec67261ecdf3e37ac22d3a2c0e';
export const RAW_PAYLOAD_SHA256 = 'd5a9d25c4bde049b0e2c2e0b2108e5dcbb75b311f1cf4dbe083f49f2b3bfb387';

async function digest(bytes, algorithm) {
  return [...new Uint8Array(await crypto.subtle.digest(algorithm, bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
}
export const sha1 = bytes => digest(bytes, 'SHA-1');
export const sha256 = bytes => digest(bytes, 'SHA-256');

export async function applyUnifiedPatch(source, payload) {
  if (source.length !== ROM_SIZE) throw new Error(`Expected ${ROM_SIZE.toLocaleString()} bytes; got ${source.length.toLocaleString()}.`);
  const [s1,s256] = await Promise.all([sha1(source),sha256(source)]);
  if (s1 !== SOURCE_SHA1 || s256 !== SOURCE_SHA256) throw new Error('This patcher requires the exact original Pokémon Unbound v2.1.1.1 ROM.');
  if (await sha256(payload) !== RAW_PAYLOAD_SHA256) throw new Error('Unified patch payload integrity check failed.');
  if (payload.length < 12 || String.fromCharCode(...payload.subarray(0,4)) !== 'UPF1') throw new Error('Unrecognized unified patch payload.');
  const view = new DataView(payload.buffer,payload.byteOffset,payload.byteLength);
  const romSize=view.getUint32(4,true), count=view.getUint32(8,true);
  if (romSize !== ROM_SIZE) throw new Error('Unified patch payload ROM-size mismatch.');
  const output=source.slice(); let at=12, lastEnd=0;
  for(let i=0;i<count;i++){
    if(at+8>payload.length)throw new Error('Truncated unified patch record header.');
    const offset=view.getUint32(at,true), length=view.getUint32(at+4,true); at+=8;
    if(offset<lastEnd || offset+length>ROM_SIZE || at+length>payload.length)throw new Error('Malformed or overlapping unified patch record.');
    output.set(payload.subarray(at,at+length),offset); at+=length; lastEnd=offset+length;
  }
  if(at!==payload.length)throw new Error('Unexpected trailing bytes in unified patch payload.');
  const [o1,o256]=await Promise.all([sha1(output),sha256(output)]);
  if(o1!==TARGET_SHA1 || o256!==TARGET_SHA256)throw new Error('Patched ROM verification failed.');
  return output;
}
