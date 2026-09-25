# Pokémon Unbound — Unified RC6 deterministic ROM patcher verification

**Verification date:** 2026-09-24  
**Result:** PASS

## Exact supported base
- Size: 33,554,432 bytes
- SHA-1: `b4776b82a4c7915d0fadeaa27e013523f99dfd94`
- SHA-256: `7aa25bbf568f7cfcf6ee1cf2e9e6ff637350b3d0705c2375cabb6baa7d9739f7`

## Exact RC6 output
- Size: 33,554,432 bytes
- SHA-1: `15b818eb3b6028100cc7eebc68e72a44bf96f7af`
- SHA-256: `fcefa1341858363be236e57cd4b1bfcd725dc4ec67261ecdf3e37ac22d3a2c0e`

## Final Soul Requiem presentation
- Item ID remains **729 / 0x02D9**.
- Name field is **Soul Requiem**.
- Item 729 icon graphics and palette pointer pair exactly equals native **Soul Dew / item 191**.
- Soul Dew is not modified.
- No recolor or custom item-icon pixels are present.
- RC5 → RC6 differs by only 10 physical ROM bytes: four name bytes and six pointer bytes.

## Patch payload
- `Unbound_Final_Unified_2026-09-24_RC6.upf`
- Bytes: 476,359
- SHA-256: `d5a9d25c4bde049b0e2c2e0b2108e5dcbb75b311f1cf4dbe083f49f2b3bfb387`
- Records: 769

## Fresh reproducibility rerun
- Run 1: SHA-1 `15b818eb3b6028100cc7eebc68e72a44bf96f7af`; SHA-256 `fcefa1341858363be236e57cd4b1bfcd725dc4ec67261ecdf3e37ac22d3a2c0e`; byte-identical to accepted RC6 target: YES
- Run 2: SHA-1 `15b818eb3b6028100cc7eebc68e72a44bf96f7af`; SHA-256 `fcefa1341858363be236e57cd4b1bfcd725dc4ec67261ecdf3e37ac22d3a2c0e`; byte-identical to accepted RC6 target: YES
- Run 3: SHA-1 `15b818eb3b6028100cc7eebc68e72a44bf96f7af`; SHA-256 `fcefa1341858363be236e57cd4b1bfcd725dc4ec67261ecdf3e37ac22d3a2c0e`; byte-identical to accepted RC6 target: YES

Run 1 = Run 2 = Run 3: **YES**

## Input guard
The RC6 output itself does not match the exact supported base hashes, so the exact-input guard rejects it as an input: **PASS**.

## Release boundary
The package contains no ROM and no save. The browser patcher requires the user's exact original Unbound v2.1.1.1 ROM and verifies the resulting RC6 output hashes.
