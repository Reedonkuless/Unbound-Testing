import { readFileSync, writeFileSync } from 'node:fs';

const htmlPath = 'dist/rom-patcher/index.html';
let html = readFileSync(htmlPath, 'utf8');

const moduleBlock = /<script type="module">[\s\S]*?<\/script>/;
if (!moduleBlock.test(html)) throw new Error('ROM patcher module block not found');
html = html.replace(moduleBlock, '<script src="./upf.js"></script>\n<script src="./patcher.js"></script>');

html = html.replace(
  '<p>Your original ROM stays local in the browser. No ROM is uploaded or bundled.</p>',
  '<p>Your original ROM stays local in the browser. No ROM is uploaded or bundled.</p><p style="padding:12px 14px;border:1px solid #8ac99b;border-radius:12px"><strong>iPhone/iPad:</strong> this patcher must run in Safari. If you opened it inside ChatGPT or another in-app browser, tap the compass / Open in Safari button first. If the status below never changes to <em>JavaScript active</em>, the current browser is blocking the patcher.</p>'
);

html = html.replace(
  '<strong>Select exact Unbound v2.1.1.1 ROM</strong>',
  '<strong>Choose ROM &amp; patch automatically</strong>'
);
html = html.replace(
  '<input id="rom" type="file" accept=".gba,application/octet-stream">',
  '<input id="rom" type="file" accept=".gba,application/octet-stream" onchange="window.UnboundDirectPatch(this)">'
);
html = html.replace(
  '<button id="patch-rom" class="primary-button" type="button" disabled>Patch ROM</button>',
  '<button id="patch-rom" class="primary-button" type="button" onclick="document.getElementById(\'rom\').click()">Choose ROM &amp; Patch</button>'
);
html = html.replace(
  '<p id="status" role="status" aria-live="polite">Waiting for original ROM.</p>',
  '<p id="status" role="status" aria-live="polite">JavaScript inactive. On iPhone, tap the compass / Open in Safari button, then reload this page.</p>'
);

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
    if (!global.crypto || !global.crypto.subtle) throw new Error('This browser does not provide Web Crypto. Open the patcher in Safari.');
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

  var outputUrl = null;
  var busy = false;

  function byId(id) { return document.getElementById(id); }

  function setStatus(text, isError) {
    var status = byId('status');
    status.textContent = text;
    if (isError) status.classList.add('error');
    else status.classList.remove('error');
  }

  function clearOutput() {
    var download = byId('download-rom');
    if (outputUrl) {
      URL.revokeObjectURL(outputUrl);
      outputUrl = null;
    }
    download.hidden = true;
    download.removeAttribute('href');
  }

  function readFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(new Uint8Array(reader.result)); };
      reader.onerror = function () { reject(reader.error || new Error('ROM file could not be read.')); };
      reader.readAsArrayBuffer(file);
    });
  }

  window.UnboundDirectPatch = async function (input) {
    if (busy) return;

    var file = null;
    try {
      file = input && input.files && input.files.length ? input.files[0] : null;
    } catch (e) {
      file = null;
    }

    if (!file) {
      setStatus('iOS returned without a readable file. Tap Choose ROM & Patch and select the .gba again.', true);
      return;
    }

    busy = true;
    clearOutput();

    var selection = byId('selection');
    var button = byId('patch-rom');
    selection.textContent = file.name + ' · ' + file.size.toLocaleString() + ' bytes';
    button.disabled = true;

    try {
      if (!window.UnboundPatcher) throw new Error('Patcher engine did not initialize. Open this page directly in Safari and reload once.');

      if (file.size !== window.UnboundPatcher.ROM_SIZE) {
        throw new Error('ROM size is not 33,554,432 bytes.');
      }

      setStatus('Reading original ROM…');
      var source = await readFile(file);

      setStatus('Loading recovered CP33 payload…');
      var response = await fetch('./Unbound_Latest_Recovered_CP33_2026-09-26.upf?ios=direct2', { cache: 'no-store' });
      if (!response.ok) throw new Error('Patch payload could not be loaded (HTTP ' + response.status + ').');
      var payload = new Uint8Array(await response.arrayBuffer());

      setStatus('Verifying clean ROM and applying recovered CP33 patch…');
      var out = await window.UnboundPatcher.applyUnifiedPatch(source, payload);

      outputUrl = URL.createObjectURL(new Blob([out], { type: 'application/octet-stream' }));
      var download = byId('download-rom');
      download.href = outputUrl;
      download.hidden = false;
      setStatus('PASS — patched ROM generated and hash-verified. Tap Download patched ROM.');
    } catch (e) {
      setStatus(e && e.message ? e.message : String(e), true);
    } finally {
      busy = false;
      button.disabled = false;
      try { input.value = ''; } catch (e) {}
    }
  };

  byId('patch-rom').disabled = false;
  setStatus('JavaScript active. Tap Choose ROM & Patch; patching starts as soon as iOS returns the file.');
})();
`);

console.log('PASS iOS direct-callback ROM patcher installed');
