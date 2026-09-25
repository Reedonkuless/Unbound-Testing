// CP33 direct browser overlay. No ROM bytes are bundled.
// This applies the preserved CP33 presentation/item builder to the exact CP27 prerequisite.
export const ROM_SIZE = 0x2000000;
export const CP27_SHA1 = '27995aec07b7111645161b4d29698d7d21e55ac9';
export const CP27_SHA256 = '5a918128ef36a8bd10261cd2d2356c744f8789d2bc48563f5b42fea5a2a9b5e4';
export const QA_COMPAT_SHA1 = '49a70fbfeb01fa6a3c6a163bea63e6c3f9ff9cda';
export const RC5_SHA1 = 'ac072162770dc1e4643823bff5519b25cc43bef7';

const GITEMS=0x00876200, ITEM_STRIDE=44, ITEM729=729, ITEM730=730;
const ICON_BASE=0x0025A554, GITEMSBYTYPE=0x00B3D100;
const FLING_OLD=0x00A7BD6C, FLING_NEW=0x00B4A000;
const FLING_REFS=[0x009B76EC,0x009D0E08,0x00A215A0,0x00A29600];
const COUNT_LITERALS=[0x009D4C78,0x00A090F8,0x01ECEBC4];
const SANITIZER=0x00B3D6C0, DAMAGE_HOOK=0x009D249E, WRAPPER_OFF=0x00B4A600;
const NAME_OFF=0x00B4A700, DESC_OFF=0x00B4A720;
const SPECIES_NAMES_BASE=0x015FBC90, SPECIES_NAME_STRIDE=11;
const ICON_GFX_TABLE=0x0163F2CC, ICON_PALIDX_TABLE=0x01640724;
const ITEM_NAME_FN=0x009F324C, ITEM_EFFECT_FN=0x009F3360, ITEM_PARAM_FN=0x009F3380;
const RELIC_CROWN_ITEM=669;

const CUSTOM_SPECIES_NAMES={1298:'Grimble',1299:'Gravibite',1300:'Dreadchomp',1301:'Frostyrant',1302:'Mournevoir'};
const CUSTOM_ICON_GFX={1298:0x01FED000,1299:0x01FED400,1300:0x01FED800,1301:0x01FEDC00,1302:0x01FEC800};
const CUSTOM_ICON_PALIDX={1298:4,1299:4,1300:5,1301:5,1302:3};
const CUSTOM_ICON_PALETTE_OFFSETS={3:0x01FECC00,4:0x01FEE000,5:0x01FEE020};
const SOUL_DEW_ICON=hex('e0e5e80874e6e808');
const EXPECTED_RELIC_CROWN_ICON=hex('fcc4ee08ccc5ee08');
const EXPECTED_HOOK=hex('2600637c');
const EXPECTED_SANITIZER=hex('b62189000231884201d3002070477047');

const ACCESSORS=[
  [ITEM_NAME_FN,'b62302009b00984200d900222c231000','b6239b000233984200d900202c23c046'],
  [ITEM_EFFECT_FN,'b62301009b00984200d90021034b1a682c230800','b6239b000233984200d90020034b1a682c23c046'],
  [ITEM_PARAM_FN,'b62301009b00984200d90021034b1a682c230800','b6239b000233984200d90020034b1a682c23c046'],
].map(([o,a,b])=>[o,hex(a),hex(b)]);

function hex(s){const a=new Uint8Array(s.length/2);for(let i=0;i<a.length;i++)a[i]=parseInt(s.slice(i*2,i*2+2),16);return a;}
function equalAt(b,o,x){if(o<0||o+x.length>b.length)return false;for(let i=0;i<x.length;i++)if(b[o+i]!==x[i])return false;return true;}
function allFF(b,s,e){for(let i=s;i<e;i++)if(b[i]!==0xff)return false;return true;}
function u32(b,o){return (b[o]|(b[o+1]<<8)|(b[o+2]<<16)|(b[o+3]<<24))>>>0;}
function w16(b,o,v){b[o]=v&255;b[o+1]=(v>>>8)&255;}
function w32(b,o,v){v>>>=0;b[o]=v&255;b[o+1]=(v>>>8)&255;b[o+2]=(v>>>16)&255;b[o+3]=(v>>>24)&255;}
function put(b,o,x){b.set(x,o);}
function enc(s){const out=[];for(const ch of s){let v;if(ch===' ')v=0;else if(ch>='A'&&ch<='Z')v=0xBB+ch.charCodeAt(0)-65;else if(ch>='a'&&ch<='z')v=0xD5+ch.charCodeAt(0)-97;else if(ch>='0'&&ch<='9')v=0xA1+ch.charCodeAt(0)-48;else if(ch==="'")v=0xB4;else if(ch==='.')v=0xAD;else if(ch==='-')v=0xAE;else if(ch==='\n')v=0xFE;else throw new Error('Unsupported encoded character: '+ch);out.push(v);}out.push(0xFF);return Uint8Array.from(out);}
function encSpecies(s){const out=[];for(const ch of s){if(ch>='A'&&ch<='Z')out.push(0xBB+ch.charCodeAt(0)-65);else if(ch>='a'&&ch<='z')out.push(0xD5+ch.charCodeAt(0)-97);else if(ch>='0'&&ch<='9')out.push(0xA1+ch.charCodeAt(0)-48);else if(ch===' ')out.push(0);else throw new Error('Unsupported species-name character: '+ch);}out.push(0xFF);if(out.length>SPECIES_NAME_STRIDE)throw new Error('Species name too long: '+s);while(out.length<SPECIES_NAME_STRIDE)out.push(0xFF);return Uint8Array.from(out);}
function thumbBL(srcOff,targetGba){const src=0x08000000+srcOff;const delta=targetGba-(src+4);if(delta&1)throw new Error('Unaligned BL target');if(delta < -0x400000 || delta >= 0x400000)throw new Error('BL out of range');const off=delta>>1;const h1=0xF000|((off>>11)&0x7FF);const h2=0xF800|(off&0x7FF);const x=new Uint8Array(4);w16(x,0,h1);w16(x,2,h2);return x;}

export function applyCp33Overlay(source, assets, {allowCompatibilityInputs=false}={}) {
  if(!(source instanceof Uint8Array))source=new Uint8Array(source);
  if(source.length!==ROM_SIZE)throw new Error(`Expected ${ROM_SIZE.toLocaleString()} bytes; got ${source.length.toLocaleString()}.`);
  if(!assets?.wrapper || assets.wrapper.length>0x100)throw new Error('Frozen Sovereignty wrapper is missing or too large.');
  const b=source.slice();

  if(!equalAt(b,DAMAGE_HOOK,EXPECTED_HOOK))throw new Error('Damage-hook prerequisite mismatch.');
  for(const o of COUNT_LITERALS)if(u32(b,o)!==730)throw new Error(`Item-count prerequisite mismatch at 0x${o.toString(16)}.`);
  if(!equalAt(b,SANITIZER,EXPECTED_SANITIZER))throw new Error('Item sanitizer prerequisite mismatch.');
  for(const o of FLING_REFS)if(u32(b,o)!==0x08A7BD6C)throw new Error('gFlingTable prerequisite mismatch.');
  if(!allFF(b,GITEMS+ITEM730*ITEM_STRIDE,GITEMS+(ITEM730+1)*ITEM_STRIDE))throw new Error('Item 730 record is not free.');
  if(!allFF(b,FLING_NEW,0x00B4A800))throw new Error('CP33 item allocation corridor is not free.');

  for(const [off,expected,repl] of ACCESSORS){if(!equalAt(b,off,expected))throw new Error(`Native item accessor prerequisite mismatch at 0x${off.toString(16)}.`);put(b,off,repl);}

  for(const [species,name] of Object.entries(CUSTOM_SPECIES_NAMES)){put(b,SPECIES_NAMES_BASE+Number(species)*SPECIES_NAME_STRIDE,encSpecies(name));}

  const item729=GITEMS+ITEM729*ITEM_STRIDE; const soulName=enc('Soul Requiem');
  b.fill(0,item729,item729+14); put(b,item729,soulName.slice(0,14));
  put(b,ICON_BASE+ITEM729*8,SOUL_DEW_ICON);

  const expert=source.slice(GITEMS+235*ITEM_STRIDE,GITEMS+236*ITEM_STRIDE);const rec=expert.slice();
  rec.fill(0,0,14);w32(rec,0,0x08000000+NAME_OFF);w16(rec,0x0E,ITEM730);w16(rec,0x10,0);rec[0x12]=100;rec[0x13]=0;w32(rec,0x14,0x08000000+DESC_OFF);rec[0x18]=0;rec[0x19]=0;rec[0x1A]=1;rec[0x1B]=4;w32(rec,0x1C,0x080A2239);rec[0x20]=0;w32(rec,0x24,0);rec[0x28]=0;
  put(b,GITEMS+ITEM730*ITEM_STRIDE,rec);
  put(b,NAME_OFF,enc("Tyrant's Crown"));
  put(b,DESC_OFF,enc('Boosts Ice attacks\nand softens super-\neffective hits.'));
  const relic=source.slice(ICON_BASE+RELIC_CROWN_ITEM*8,ICON_BASE+(RELIC_CROWN_ITEM+1)*8);if(!equalAt(relic,0,EXPECTED_RELIC_CROWN_ICON))throw new Error('Native Relic Crown icon prerequisite mismatch.');put(b,ICON_BASE+ITEM730*8,relic);

  for(const [species,name] of Object.entries(CUSTOM_SPECIES_NAMES)){
    const key=`${name.toLowerCase()}_party_icon_32x64.4bpp`, raw=assets[key];
    if(!raw || raw.length!==1024)throw new Error(`${name} party icon asset is missing or invalid.`);
    const id=Number(species),off=CUSTOM_ICON_GFX[id];put(b,off,raw);w32(b,ICON_GFX_TABLE+id*4,0x08000000+off);b[ICON_PALIDX_TABLE+id]=CUSTOM_ICON_PALIDX[id];
  }
  for(const [slot,off] of Object.entries(CUSTOM_ICON_PALETTE_OFFSETS)){const key=`party_icon_palette_slot${slot}.gbapal`,pal=assets[key];if(!pal||pal.length!==32)throw new Error(`Party icon palette slot ${slot} is missing or invalid.`);put(b,off,pal);}

  for(const o of COUNT_LITERALS)w32(b,o,731); b[SANITIZER+4]=0x03;b[SANITIZER+5]=0x31;w16(b,GITEMSBYTYPE+ITEM730*2,45);
  put(b,FLING_NEW,source.slice(FLING_OLD,FLING_OLD+730*2)); b[FLING_NEW+730*2]=0;b[FLING_NEW+730*2+1]=0;for(const o of FLING_REFS)w32(b,o,0x08000000+FLING_NEW);
  put(b,WRAPPER_OFF,assets.wrapper);put(b,DAMAGE_HOOK,thumbBL(DAMAGE_HOOK,0x08000000+WRAPPER_OFF));
  return b;
}

export async function digest(bytes,algorithm){const buf=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);return [...new Uint8Array(await crypto.subtle.digest(algorithm,buf))].map(v=>v.toString(16).padStart(2,'0')).join('');}
export const sha1=b=>digest(b,'SHA-1');
export const sha256=b=>digest(b,'SHA-256');
