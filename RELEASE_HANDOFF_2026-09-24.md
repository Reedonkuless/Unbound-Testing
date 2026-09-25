# Pokémon Unbound — Save Studio v0.4.0 Unified RC6 release handoff

RC6 supersedes RC5 for ROM patching. It finalizes the Mournevoir held item presentation as **Soul Requiem**.

## Exact ROM target
- SHA-1 `15b818eb3b6028100cc7eebc68e72a44bf96f7af`
- SHA-256 `fcefa1341858363be236e57cd4b1bfcd725dc4ec67261ecdf3e37ac22d3a2c0e`

## Soul Requiem finalization
- Custom item remains **item 729 / 0x02D9**.
- Player-facing name: **Soul Requiem**.
- Icon graphics: exact native **Soul Dew (item 191)** graphics pointer.
- Icon palette: exact native **Soul Dew (item 191)** palette pointer.
- No recolor and no custom icon pixels.
- Existing item mechanics and Mournevoir evolution logic remain keyed to item 729 and are unchanged.

## Preserved RC5 work
- Permafrost one-line summary description.
- Approved 32×32 custom party icons for species 1298–1301.
- ItemId_GetName custom-item resolver for item 729.
- Previously accepted Mournevoir / Heart of Darkness / Soul Requiem battle behavior and Garchomp/Frostyrant mechanics remain unchanged outside the two presentation fields above.

## Reproducibility
- UPF payload: `Unbound_Final_Unified_2026-09-24_RC6.upf`
- Payload SHA-256: `d5a9d25c4bde049b0e2c2e0b2108e5dcbb75b311f1cf4dbe083f49f2b3bfb387`
- Reapplying the payload to the exact supported base reproduces the RC6 target byte-for-byte.
- ROMs and saves are not bundled.
