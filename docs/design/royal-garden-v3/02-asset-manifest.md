# Assets and provenance

Untouched user source art and HEICs are preserved in [sources/royal-garden-cinematic.zip](sources/royal-garden-cinematic.zip), outside the public runtime. The archive is 26,843,923 bytes; SHA-256 `0365d8117bd5f8fbe63c72741a5550a88848da5bd5d672e5adcab762fdead514`. [asset-manifest.json](asset-manifest.json) records production dimensions, byte counts and checksums.

| Source | Actual properties | Production use |
| --- | --- | --- |
| ornate_golden_khmer_wedding_frame.webp | 941×1672, RGB, opaque blue | Faithful transparent frame reconstruction; 640/941px WebP |
| royal-garden-golden-save-the-date.webp | 3840×2160, RGBA | 640/1100px foreground lettering; contain fit |
| royal-blue-golden-khmer-guest-name-frame-4k.webp | 3840×1280, RGBA, white text field | 960px guest frame; live HTML text |
| royal-blue-golden-khmer-footer-4k.webp | 3840×1280, RGBA | 960px film and closing footer |
| royal-blue-golden-khmer-information-background-4k.webp | 2160×3840, RGB | 640/1200px information background |
| butto_invitation.webp | Existing user-specified repository artwork | Optional decorative opening button; accessible live label and text-button alternative |
| User MP4 ending EBnbE.mp4 | 576×1024, 30fps, H.264, 44.37s, HE-AACv2 | Catalog preview only; original video frames retained, audio normalized to AAC-LC, metadata stripped, faststart index; 6,457,854 bytes |

The image-generation tool reconstructed the gold frame with true transparency from the supplied original. The request explicitly removed the blue center and gaps while preserving gold pillars, pearls, flowers and filigree. [frame-proof.jpg](evidence/frame-proof.jpg) compares it over light, dark and a photograph. No original blue-backed frame is placed over an owner photo.

The ivory/gold butterfly is an original image-generation-tool asset, reduced to 160×160 WebP. It is optional and has no remote hotlink. Birds are not enabled or shipped; they were optional in the brief. The frame and butterfly originals remain in the tool's generated_images directory on the workstation. Production derivatives are under public/templates/royal-garden/v3. Pillow/ffmpeg were processing tools only; no runtime dependency was added.

All supplied art/video is used at the user's direction for this project; this is provenance, not independent verification of third-party commercial rights. The pre-existing demo photos retain their repository provenance. No Canva generation/export is claimed.

Responsive derivatives use Lanczos resizing and WebP quality 87 (91 for the intricate arch). All eleven production images together total approximately 2.43 MB, before choosing responsive variants. Only entrance assets are mounted initially; film and information assets mount on their scenes. The full source archive is never included in the web payload.
