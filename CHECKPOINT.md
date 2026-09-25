# Pokémon Unbound Save Studio v0.5.0 — CP33 editor/patcher checkpoint

**Status:** EDITOR METADATA UPDATED + CP33 DIRECT OVERLAY PATCHER IMPLEMENTED + STATIC/ROUND-TRIP QA PASS

## Editor updates
- species 1298–1302 use final mixed-case names
- Mournevoir base stats: 68/85/65/165/135/100
- Mournevoir virtual ability: Eclipse Heart
- item729: Soul Requiem
- item730: Tyrant's Crown
- move925: Dark Whisper, 20 PP
- move926: Fey Bane, 10 PP
- existing Glacial Rend 923 / TyrantPrison 924 and Permafrost 77 preserved

## Editor QA
- Party round-trip: Mournevoir + item730 + moves 925/926/923/924 + Eclipse Heart — PASS
- PC round-trip: same custom fields — PASS
- Frostyrant + item730 + Permafrost + custom moves — PASS
- PP initialization: 925=20, 926=10, 923=10, 924=5 — PASS

## Latest ROM patcher
Primary patcher requires the exact CP27 prerequisite:
- SHA-1 `27995aec07b7111645161b4d29698d7d21e55ac9`
- SHA-256 `5a918128ef36a8bd10261cd2d2356c744f8789d2bc48563f5b42fea5a2a9b5e4`

It implements the preserved CP33 builder directly in-browser and bundles no ROM bytes.

Offline cross-check on the historical QA-compatible branch:
- Python CP33 builder output SHA-1 `bf5200076f5908e7e68b8dd4c79c0f7595172fc2`
- JavaScript CP33 overlay output SHA-1 `bf5200076f5908e7e68b8dd4c79c0f7595172fc2`
- output SHA-256 `24e80fbfaeb97662ff9c9ad251167cb1b6d41b1ed27137174484d49504e0e5d1`
- byte-for-byte equality: PASS

This validates the browser port against the canonical CP33 Python builder on a supported compatibility input.

## Known release boundary
A clean-base -> latest CP33 patch cannot be honestly produced until the exact CP27 prerequisite is recovered/reconstructed. The primary patcher therefore refuses the clean base. The old exact RC6 clean-base patcher remains under `rom-patcher/legacy-rc6.html` and is explicitly labeled legacy.

No production deployment was changed by this checkpoint.
