# Save Studio v0.5.0 / CP33 focused manual QA

1. Open a known-good Unbound v2.1.1.1 save.
2. Select or create Mournevoir. Confirm the editor shows **Eclipse Heart · Virtual** and final stats are used for party stat recalculation.
3. Set held item **Soul Requiem (729)** and confirm save/export/reload preserves 729.
4. Set held item **Tyrant's Crown (730)** and confirm save/export/reload preserves 730.
5. Assign **Dark Whisper (925)** and **Fey Bane (926)**. On party Pokémon their initialized PP should be 20 and 10 respectively.
6. Select Frostyrant and confirm ability **Permafrost**, then assign Tyrant's Crown and the custom signature moves.
7. For the latest ROM patcher, use only the exact CP27 prerequisite hash. Confirm all other ROMs are refused.
8. After CP33 generation, record the displayed SHA-1/SHA-256 and use that exact binary for the final in-game presentation/runtime matrix.
9. Confirm in game: mixed-case custom names; all five two-frame party icons; Eclipse Heart/Permafrost descriptions; Soul Requiem/Tyrant's Crown names; Tyrant's Crown Relic Crown artwork; no held-item `????`.
