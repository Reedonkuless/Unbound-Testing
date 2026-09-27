# Dreadchomp live-table correction v0.5.3

The prior CP33 presentation script wrote to pre-Mournevoir party-icon table addresses. After species 1302 was integrated, the live tables moved to:

- graphics table: 0x0163F3A0
- palette-index table: 0x016407FC

Dreadchomp species 1300 must resolve to the approved 32x64 raw icon and palette slot 5.

Corrected target:
- SHA-1 1bdf1fe33fd018bebbd80c7841f6521a7b4476cb
- SHA-256 a2adf117c67a8bf8a58e4e47a96dcd43d1ceab7c2dedaaf0856b813e69967c35

The user-supplied affected ROM differed from this correction by only three bytes.
