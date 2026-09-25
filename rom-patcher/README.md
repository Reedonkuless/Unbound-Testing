# CP33 ROM patcher

Primary page: `index.html`

The latest patcher requires the exact CP27 prerequisite:
- SHA-1 `27995aec07b7111645161b4d29698d7d21e55ac9`
- SHA-256 `5a918128ef36a8bd10261cd2d2356c744f8789d2bc48563f5b42fea5a2a9b5e4`

It applies the CP33 builder directly in the browser. No ROM bytes are bundled. The output SHA-1/SHA-256 are calculated and displayed after generation.

The CP33 JavaScript overlay was compared against the canonical Python builder on the QA-compatible input and produced a byte-identical 32 MiB ROM.

Legacy clean-base RC6 patcher: `legacy-rc6.html`. RC6 is preserved for historical compatibility only and is not the latest Mournevoir redesign.
