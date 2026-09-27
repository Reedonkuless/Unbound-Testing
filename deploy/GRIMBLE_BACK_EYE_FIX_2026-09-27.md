# Grimble finalized back-sprite eye fix v0.5.4

Drive authority:
- species 1298 Grimble
- source: grimble_back_indexed_64x64.png
- source SHA-256: 153fb768703ce70db93f72e126797c15c133df0ddf5d73620297562085a845a4
- deployment contract: Grimble only; base Gible must remain unchanged

Live back-sprite surface:
- table 0x01633C64
- Grimble row 0x016364F4
- asset 0x01FE7568 / pointer 0x09FE7568

The finalized PNG was converted through the historical GBA 4bpp + shared-front-palette remap path.
Only 26 bytes in the existing compressed Grimble back-sprite allocation differ from v0.5.3.

Target:
- SHA-1 705bf4e8fc5ac80a9790d99f76acecd90743ccbd
- SHA-256 2d059a184bb1a04beb8c8ce9627697f4ff4904e07dc2f147ebeb7b8bf7fdfb8b

Manual QA reminder: a battler named Gible is native Gible and intentionally keeps the native Gible back sprite.
