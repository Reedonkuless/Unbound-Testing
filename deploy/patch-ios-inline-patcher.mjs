import { readFileSync, writeFileSync } from 'node:fs';

const cssLinks = '<link rel="stylesheet" href="../style.css"><link rel="stylesheet" href="../dark.css"><link rel="stylesheet" href="../patch.css">';

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#102b27">
<title>Pokémon Unbound Recovered CP33 ROM Patcher</title>
${cssLinks}
</head>
<body>
<main class="patch-shell"><div class="patch-card">
<span class="eyebrow">RECOVERED CP33 · CLEAN BASE · iOS INLINE BUILD</span>
<h1>Unified Pokémon Unbound patcher</h1>
<p>Starts from the untouched Pokémon Unbound v2.1.1.1 ROM and builds the deterministic recovered CP33 target.</p>
<p>Your ROM stays local in Safari. Only the small patch payload is downloaded from this site.</p>

<p style="padding:12px 14px;border:1px solid #8ac99b;border-radius:12px">
<strong>iPhone/iPad:</strong> use Safari. The status below must say <em>JavaScript active</em> before choosing your ROM.
</p>

<label class="dropzone" for="rom">
  <strong>Choose ROM &amp; patch automatically</strong>
  <span>32 MiB .gba · clean SHA-1 starts b4776b82…</span>
  <input id="rom" type="file" accept=".gba,application/octet-stream">
</label>

<p id="selection" class="patch-selection">No ROM selected.</p>

<div class="patch-actions">
  <button id="choose-rom" class="primary-button" type="button">Choose ROM &amp; Patch</button>
  <a id="download-rom" class="primary-button patch-download" href="#" download="Pokemon Unbound - Latest Recovered CP33.gba" hidden>Download patched ROM</a>
</div>

<p id="status" role="status" aria-live="polite">JavaScript inactive. Enable JavaScript in Safari, then reload.</p>

<p class="hash-note">
Expected output SHA-1:<br>
<code>1037b82bd50a4cad4d3fa63316da79f403e0e7d1</code><br>
Expected output SHA-256:<br>
<code>9c52a435a7159a721bf6fd532fa03e4bb435ddf4956b6a5c6c14a83e92ac288f</code>
</p>
<p><a href="../">Back to Save Studio</a></p>
</div></main>

<noscript><p style="padding:16px">JavaScript is disabled. Enable JavaScript in Safari Settings and reload this page.</p></noscript>

<script>
(function () {
  var ROM_SIZE = 33554432;
  var SOURCE_SHA1 = 'b4776b82a4c7915d0fadeaa27e013523f99dfd94';
  var SOURCE_SHA256 = '7aa25bbf568f7cfcf6ee1cf2e9e6ff637350b3d0705c2375cabb6baa7d9739f7';
  var TARGET_SHA1 = '1037b82bd50a4cad4d3fa63316da79f403e0e7d1';
  var TARGET_SHA256 = '9c52a435a7159a721bf6fd532fa03e4bb435ddf4956b6a5c6c14a83e92ac288f';
  var PAYLOAD_SHA256 = '82a7887b91db41ff7402cd0c92e1c23ca9e1c0548940ea250fa92a12201ee33e';
  var PAYLOAD_URL = './Unbound_Latest_Recovered_CP33_2026-09-26.upf?inline-ios=1';

  var input = document.getElementById('rom');
  var choose = document.getElementById('choose-rom');
  var download = document.getElementById('download-rom');
  var selection = document.getElementById('selection');
  var status = document.getElementById('status');
  var outputUrl = null;
  var busy = false;

  function setStatus(text, isError) {
    status.textContent = text;
    if (isError) status.classList.add('error');
    else status.classList.remove('error');
  }

  function hex(buffer) {
    var a = new Uint8Array(buffer);
    var s = '';
    var i;
    for (i = 0; i < a.length; i++) s += a[i].toString(16).padStart(2, '0');
    return s;
  }

  function digest(bytes, algorithm) {
    if (!window.crypto || !window.crypto.subtle) {
      return Promise.reject(new Error('Safari Web Crypto is unavailable. Check Safari JavaScript settings.'));
    }
    return window.crypto.subtle.digest(algorithm, bytes).then(hex);
  }

  function readFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(new Uint8Array(reader.result)); };
      reader.onerror = function () { reject(reader.error || new Error('ROM file could not be read.')); };
      reader.readAsArrayBuffer(file);
    });
  }

  function loadPayload() {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', PAYLOAD_URL, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300 && xhr.response) resolve(new Uint8Array(xhr.response));
        else reject(new Error('Patch payload could not be loaded (HTTP ' + xhr.status + ').'));
      };
      xhr.onerror = function () { reject(new Error('Patch payload network request failed.')); };
      xhr.send();
    });
  }

  function applyPatch(source, payload) {
    return Promise.all([digest(source, 'SHA-1'), digest(source, 'SHA-256')]).then(function (sourceHashes) {
      if (sourceHashes[0] !== SOURCE_SHA1 || sourceHashes[1] !== SOURCE_SHA256) {
        throw new Error('This is not the exact clean Pokémon Unbound v2.1.1.1 ROM.');
      }
      return digest(payload, 'SHA-256');
    }).then(function (payloadHash) {
      if (payloadHash !== PAYLOAD_SHA256) throw new Error('Patch payload integrity check failed.');
      if (payload.length < 12 ||
          payload[0] !== 0x55 || payload[1] !== 0x50 ||
          payload[2] !== 0x46 || payload[3] !== 0x31) {
        throw new Error('Unrecognized patch payload.');
      }

      var view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
      var romSize = view.getUint32(4, true);
      var count = view.getUint32(8, true);
      if (romSize !== ROM_SIZE) throw new Error('Patch payload ROM-size mismatch.');

      var output = source.slice();
      var at = 12;
      var lastEnd = 0;
      var i, offset, length;
      for (i = 0; i < count; i++) {
        if (at + 8 > payload.length) throw new Error('Truncated patch record header.');
        offset = view.getUint32(at, true);
        length = view.getUint32(at + 4, true);
        at += 8;
        if (offset < lastEnd || offset + length > ROM_SIZE || at + length > payload.length) {
          throw new Error('Malformed patch record.');
        }
        output.set(payload.subarray(at, at + length), offset);
        at += length;
        lastEnd = offset + length;
      }
      if (at !== payload.length) throw new Error('Unexpected trailing patch bytes.');

      return Promise.all([digest(output, 'SHA-1'), digest(output, 'SHA-256')]).then(function (outHashes) {
        if (outHashes[0] !== TARGET_SHA1 || outHashes[1] !== TARGET_SHA256) {
          throw new Error('Patched ROM verification failed.');
        }
        return output;
      });
    });
  }

  function clearOutput() {
    if (outputUrl) {
      URL.revokeObjectURL(outputUrl);
      outputUrl = null;
    }
    download.hidden = true;
    download.removeAttribute('href');
  }

  function patchFile(file) {
    if (!file || busy) return;
    busy = true;
    clearOutput();
    selection.textContent = file.name + ' · ' + file.size.toLocaleString() + ' bytes';
    choose.disabled = true;

    if (file.size !== ROM_SIZE) {
      setStatus('ROM size is not 33,554,432 bytes.', true);
      busy = false;
      choose.disabled = false;
      input.value = '';
      return;
    }

    setStatus('Reading original ROM…');
    readFile(file).then(function (source) {
      setStatus('Downloading patch payload…');
      return loadPayload().then(function (payload) {
        setStatus('Verifying clean ROM and applying recovered CP33 patch…');
        return applyPatch(source, payload);
      });
    }).then(function (output) {
      outputUrl = URL.createObjectURL(new Blob([output], { type: 'application/octet-stream' }));
      download.href = outputUrl;
      download.hidden = false;
      setStatus('PASS — patched ROM generated and hash-verified. Tap Download patched ROM.');
    }).catch(function (err) {
      setStatus(err && err.message ? err.message : String(err), true);
    }).then(function () {
      busy = false;
      choose.disabled = false;
      try { input.value = ''; } catch (e) {}
    });
  }

  choose.onclick = function () { input.click(); };
  input.onchange = function () {
    if (input.files && input.files.length) patchFile(input.files[0]);
    else setStatus('No file was returned by Safari. Choose the .gba again.', true);
  };

  setStatus('JavaScript active. Tap Choose ROM & Patch.');
})();
</script>
</body>
</html>`;

writeFileSync('dist/rom-patcher/index.html', html);
console.log('PASS self-contained inline iOS ROM patcher installed');
