import { readFileSync, writeFileSync } from 'node:fs';

const htmlPath = 'dist/rom-patcher/index.html';
let html = readFileSync(htmlPath, 'utf8');
const moduleBlock = /<script type="module">[\s\S]*?<\/script>/;
if (!moduleBlock.test(html)) throw new Error('ROM patcher module block not found');
html = html.replace(moduleBlock, '<script src="./upf.js"></script>\n<script src="./patcher.js"></script>');
writeFileSync(htmlPath, html);

writeFileSync('dist/rom-patcher/upf.js', String.raw`(function (global) {
  'use strict';
  var ROM_SIZE = 0x2000000;
  var SOURCE_SHA1 = 'b4776b82a4c7915d0fadeaa27e013523f99dfd94';
  var SOURCE_SHA256 = '7aa25bbf568f7cfcf6ee1cf2e9e6ff637350b3d0705c2375cabb6baa7d9739f7';
  var TARGET_SHA1 = '1037b82bd50a4cad4d3fa63316da79f403e0e7d1';
  var TARGET_SHA256 = '9c52a435a7159a721bf6fd532fa03e4bb435ddf4956b6a5c6c14a83e92ac288f';
  var RAW_PAYLOAD_SHA256 = '82a7887b91db41ff7402cd0c92e1c23ca9e1c0548940ea250fa92a12201ee33e';

  async function digest(bytes, algorithm) {
    var result = await global.crypto.subtle.digest(algorithm, bytes);
    var a = new Uint8Array(result);
    var out = '';
    for (var i = 0; i < a.length; i++) out += a[i].toString(16).padStart(2, '0');
    return out;
  }

  async function applyUnifiedPatch(source, payload) {
    if (source.length !== ROM_SIZE) throw new Error('Expected ' + ROM_SIZE.toLocaleString() + ' bytes; got ' + source.length.toLocaleString() + '.');
    var hashes = await Promise.all([digest(source, 'SHA-1'), digest(source, 'SHA-256')]);
    if (hashes[0] !== SOURCE_SHA1 || hashes[1] !== SOURCE_SHA256) throw new Error('This patcher requires the exact original Pokémon Unbound v2.1.1.1 ROM.');
    if (await digest(payload, 'SHA-256') !== RAW_PAYLOAD_SHA256) throw new Error('Recovered CP33 patch payload integrity check failed.');
    if (payload.length < 12 || String.fromCharCode.apply(null, payload.subarray(0, 4)) !== 'UPF1') throw new Error('Unrecognized patch payload.');

    var view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
    var romSize = view.getUint32(4, true);
    var count = view.getUint32(8, true);
    if (romSize !== ROM_SIZE) throw new Error('Patch payload ROM-size mismatch.');

    var output = source.slice();
    var at = 12;
    var lastEnd = 0;
    for (var i = 0; i < count; i++) {
      if (at + 8 > payload.length) throw new Error('Truncated patch record header.');
      var offset = view.getUint32(at, true);
      var length = view.getUint32(at + 4, true);
      at += 8;
      if (offset < lastEnd || offset + length > ROM_SIZE || at + length > payload.length) throw new Error('Malformed or overlapping patch record.');
      output.set(payload.subarray(at, at + length), offset);
      at += length;
      lastEnd = offset + length;
    }
    if (at !== payload.length) throw new Error('Unexpected trailing bytes in patch payload.');

    var outHashes = await Promise.all([digest(output, 'SHA-1'), digest(output, 'SHA-256')]);
    if (outHashes[0] !== TARGET_SHA1 || outHashes[1] !== TARGET_SHA256) throw new Error('Patched ROM verification failed.');
    return output;
  }

  global.UnboundPatcher = {
    ROM_SIZE: ROM_SIZE,
    applyUnifiedPatch: applyUnifiedPatch
  };
})(window);
`);

writeFileSync('dist/rom-patcher/patcher.js', String.raw`(function () {
  'use strict';

  function byId(id) { return document.getElementById(id); }
  var input = byId('rom');
  var button = byId('patch-rom');
  var download = byId('download-rom');
  var selection = byId('selection');
  var status = byId('status');
  var outputUrl = null;
  var lastSignature = '';

  function setStatus(text, isError) {
    status.textContent = text;
    if (isError) status.classList.add('error');
    else status.classList.remove('error');
  }

  function clearOutput() {
    if (outputUrl) {
      URL.revokeObjectURL(outputUrl);
      outputUrl = null;
    }
    download.hidden = true;
    download.removeAttribute('href');
  }

  function getSelectedFile() {
    try {
      return input.files && input.files.length ? input.files[0] : null;
    } catch (e) {
      return null;
    }
  }

  function syncSelection(force) {
    var file = getSelectedFile();
    var signature = file ? (file.name + '|' + file.size + '|' + file.lastModified) : '';
    if (!force && signature === lastSignature) return;
    lastSignature = signature;
    clearOutput();

    if (!file) {
      selection.textContent = 'No ROM selected.';
      button.disabled = true;
      setStatus('Waiting for original ROM.');
      return;
    }

    selection.textContent = file.name + ' · ' + file.size.toLocaleString() + ' bytes';
    if (!window.UnboundPatcher) {
      button.disabled = true;
      setStatus('Patcher engine did not initialize. Reload this page and try again.', true);
      return;
    }

    var validSize = file.size === window.UnboundPatcher.ROM_SIZE;
    button.disabled = !validSize;
    if (validSize) setStatus('ROM selected. Tap Patch ROM to verify it.');
    else setStatus('ROM size is not 33,554,432 bytes.', true);
  }

  function readFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(new Uint8Array(reader.result)); };
      reader.onerror = function () { reject(reader.error || new Error('ROM file could not be read.')); };
      reader.readAsArrayBuffer(file);
    });
  }

  input.addEventListener('change', function () { syncSelection(true); });
  input.addEventListener('input', function () { syncSelection(true); });
  window.addEventListener('focus', function () { setTimeout(function () { syncSelection(true); }, 150); });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) setTimeout(function () { syncSelection(true); }, 150);
  });

  var poll = setInterval(function () {
    if (!document.hidden) syncSelection(false);
  }, 500);

  button.addEventListener('click', async function () {
    var file = getSelectedFile();
    if (!file) {
      syncSelection(true);
      return;
    }

    clearOutput();
    button.disabled = true;
    input.disabled = true;

    try {
      setStatus('Reading original ROM…');
      var source = await readFile(file);

      setStatus('Loading recovered CP33 payload…');
      var response = await fetch('./Unbound_Latest_Recovered_CP33_2026-09-26.upf', { cache: 'no-store' });
      if (!response.ok) throw new Error('Patch payload could not be loaded (HTTP ' + response.status + ').');
      var payload = new Uint8Array(await response.arrayBuffer());

      setStatus('Verifying and applying patch…');
      var out = await window.UnboundPatcher.applyUnifiedPatch(source, payload);

      outputUrl = URL.createObjectURL(new Blob([out], { type: 'application/octet-stream' }));
      download.href = outputUrl;
      download.hidden = false;
      setStatus('PASS — latest recovered CP33 ROM generated and hash-verified.');
    } catch (e) {
      setStatus(e && e.message ? e.message : String(e), true);
    } finally {
      input.disabled = false;
      syncSelection(true);
    }
  });

  window.addEventListener('pagehide', function () {
    clearInterval(poll);
    clearOutput();
  });

  setStatus('Patcher ready. Select the original ROM.');
  syncSelection(true);
})();
`);

console.log('PASS iOS-safe classic ROM patcher installed');
