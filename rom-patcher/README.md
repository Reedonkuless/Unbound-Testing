# CP33 ROM patcher

Primary page: `index.html`

## Accepted inputs

1. Exact clean Pokémon Unbound v2.1.1.1:
   - SHA-1 `b4776b82a4c7915d0fadeaa27e013523f99dfd94`
   - SHA-256 `7aa25bbf568f7cfcf6ee1cf2e9e6ff637350b3d0705c2375cabb6baa7d9739f7`

   The browser first applies the exact retained RC6 unified payload, then applies the CP33 item/presentation layer.

   Deterministic clean-base compatibility output:
   - SHA-1 `672d80865481cbe6531e7921b3e13f0126522205`
   - SHA-256 `72f6184dc282c430f199e1781aa8ed10a2cd86a13753c931e331b260550b3cd3`

2. Exact CP27 Mournevoir-redesign prerequisite:
   - SHA-1 `27995aec07b7111645161b4d29698d7d21e55ac9`
   - SHA-256 `5a918128ef36a8bd10261cd2d2356c744f8789d2bc48563f5b42fea5a2a9b5e4`

   This path applies the CP33 overlay directly to the full CP27 redesign candidate.

## Important distinction

The original clean-base → CP27 payload was not retained. The clean-base route is therefore a verified CP33 compatibility build on the RC6 gameplay branch, not a claim that the missing CP27 redesign bytes were reconstructed.

No ROM bytes are bundled. All patching occurs locally in the browser.
