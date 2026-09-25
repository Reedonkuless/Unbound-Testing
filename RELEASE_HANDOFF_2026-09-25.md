# Pokémon Unbound — Save Studio v0.5.0 CP33 handoff

This package updates the save editor to the latest locked custom-data design and replaces the main ROM patcher page with a strict CP33 direct-overlay patcher.

## Editor authority
- Grimble 1298
- Gravibite 1299
- Dreadchomp 1300
- Frostyrant 1301
- Mournevoir 1302
- Permafrost ability 77
- Mournevoir virtual ability: Eclipse Heart
- Glacial Rend 923
- TyrantPrison 924
- Dark Whisper 925
- Fey Bane 926
- Soul Requiem 729
- Tyrant's Crown 730 / Frozen Sovereignty
- Mournevoir stats 68/85/65/165/135/100

## ROM patcher authority
Latest CP33 patching requires exact CP27:
- SHA-1 `27995aec07b7111645161b4d29698d7d21e55ac9`
- SHA-256 `5a918128ef36a8bd10261cd2d2356c744f8789d2bc48563f5b42fea5a2a9b5e4`

The browser implementation has been cross-validated byte-for-byte against the canonical CP33 Python builder on the historical QA-compatible input. The actual CP33 target hash remains intentionally unclaimed until an exact CP27 ROM is supplied and patched.

`rom-patcher/legacy-rc6.html` is retained only for the older exact clean-base RC6 build and must not be mistaken for the latest Mournevoir redesign.

No production Vercel deployment is authorized or performed by this package.
