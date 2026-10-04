# CP08 tooling repair preview — not production accepted

Owner confirmed the retained original source as Pokémon Unbound v2.1.1.1 on 2026-10-04. Source SHA-1 b4776b82a4c7915d0fadeaa27e013523f99dfd94 and SHA-256 7aa25bbf568f7cfcf6ee1cf2e9e6ff637350b3d0705c2375cabb6baa7d9739f7 remain enforced.

Two clean patch operations reproduce immutable CP08 byte-for-byte. Four wrong input cases are rejected. Linux Chromium browser input/download reproduces the same target hashes. Source and accepted CP08 remain unchanged.

Recovered CP07 metadata supports the complete 11-species namespace. ROM-derived checks match 33/33 species stat/growth/ability entries. All five custom move names/PP and four item names now follow CP08. Raw species ability offsets are 22 and 23; offsets 20/21 are egg groups. Mournevoir retains its accepted virtual Eclipse Heart behavior.

Browser File/Blob download remains available. File sharing is offered when navigator.canShare reports file support. Both editor and patcher support the standard iOS Files/export path without File System Access API. A minimal standalone web manifest is included.

No-op native fixture export is byte-identical (131072 bytes, zero differences), and editor reimport passes. The exported save reaches native overworld without injected state. Native resave/full fixture matrix remains pending. Actual Windows Edge/Chrome, physical iPhone Safari/standalone, preview and production readbacks remain pending. Linux Chromium testing is not represented as physical Windows/iOS verification.

Do not promote until all owner-required gates pass. Acquisition/presentation/normal gameplay closeout remains pending. This branch contains tooling only, no ROM binaries.
