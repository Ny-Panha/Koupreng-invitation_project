# Ticket image failures and repair

Two independent mechanisms were reproduced.

1. **Gallery capacity:** TicketDesigner previously called `uploadGallery` for both design images. With the actual gallery limit set to one, the first gallery image uploaded successfully and the next ticket-as-gallery request returned HTTP 409, `Invitation gallery limit reached`. The real HTTP/MySQL test then uploaded ticket cover/background through the new purpose and saved/reloaded their IDs while the gallery remained at one item.
2. **Cross-origin local assets:** The genuine browser journey uploaded and saved images successfully, but ticket rendering/export could not load local-storage images anonymously from the frontend's separate origin. SecurityConfig registered CORS only for `/api/**`. The repair allows GET/HEAD for `/uploads/**` using the existing configured origin allowlist, without credentials. HTTP tests assert the permitted origin and reject an untrusted origin. The repeated live journey renders both images, reloads the design, decodes the personalized QR and downloads PNG.

The extension adds `TICKET_IMAGE`, an owned image purpose capped at 12 assets per event independently of gallery capacity. It uses the existing validation, storage compensation and invitation locking. It neither replaces the invitation's canonical cover nor raises the gallery limit. Existing ticket references to valid owned cover/gallery image IDs remain accepted. Cross-event IDs and non-images are rejected. Owner/QR entitlement checks remain effective; referenced saved assets cannot be deleted.

Preview and export continue to share `ticketRenderer`: 600×900 logical dimensions, 2×/3× PNG, existing fonts, recipient/table/seat data and unchanged QR identity. Optional focal X/Y (0–100), cover fit and background opacity (0–0.4) extend schema-1 designs. Missing fields retain the previous centered crop and 12% background alpha. Images do not cover the white QR quiet zone.

The UI now distinguishes uploading, unsaved association, saving, saved state, updating preview and export availability. File inputs reset so the same file can be retried. Cover/background have separate labeled controls and explicit removal. Unused purpose assets can be deleted after their saved association is removed. Image loading has bounded failure recovery. Mobile offers Edit and Preview & export; desktop keeps the controls and preview together.

Relevant verification lives in `Phase9MediaMySqlTests`, the Phase 9 ticket browser spec, and the inherited multi-layout/2×/3× QR export tests. Fixture browser tests prove client behavior; live evidence under `evidence/live/` proves local service wiring. Neither is evidence of bank settlement or production delivery.
