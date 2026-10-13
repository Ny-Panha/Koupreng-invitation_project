-- Add the folio renderer without repointing invitations or changing existing access.
-- Premium eligibility/prices remain owned by the server and editable by Admin Studio.
INSERT INTO templates (
    name, code, category, description, thumbnail_url, preview_url,
    is_premium, price, currency, status, sort_order, created_at, updated_at
)
SELECT 'សូត្រមង្គល / Silk Heritage',
       'silk-heritage',
       'TRADITIONAL',
       '{"presetId":"SILK_HERITAGE","theme":"SILK_HERITAGE","gateStyle":"paper","openingStyle":"paper","primaryColor":"#672C39","secondaryColor":"#B39460","backgroundColor":"#F6F0E5","coverImage":"/templates/silk-heritage/portrait.webp","enabledSections":{"countdown":true,"story":false,"schedule":true,"map":true,"gallery":true,"dressCode":false,"gift":false,"faq":false,"rsvp":true,"music":false}}',
       '/templates/silk-heritage/preview.svg',
       '/templates/silk-heritage',
       FALSE,
       0.00,
       'USD',
       'ACTIVE',
       2,
       NOW(6),
       NOW(6)
WHERE NOT EXISTS (SELECT 1 FROM templates WHERE code = 'silk-heritage');
