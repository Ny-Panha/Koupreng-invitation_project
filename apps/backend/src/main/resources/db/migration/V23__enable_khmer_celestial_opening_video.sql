-- Add the finalized cinematic opening configuration without changing the
-- checksum of the already-applied Khmer Celestial seed migration.

UPDATE templates
SET description = '{"presetId":"KHMER_CELESTIAL","theme":"KHMER_CELESTIAL","openingStyle":"celestial-cover","gateStyle":"celestial-cover","openingVideoEnabled":true,"openingVideoUrl":"/invitations/khmer-celestial/burgundy-bokeh.mp4","primaryColor":"#541722","secondaryColor":"#B88A3A","backgroundColor":"#F7F0E4","coverImage":"/facebook/all/06-card/cover-card.jpg","enabledSections":{"countdown":true,"story":true,"schedule":true,"map":true,"gallery":true,"party":false,"dressCode":true,"gift":false,"faq":false,"rsvp":true,"music":true}}',
    updated_at = NOW(6)
WHERE code = 'khmer-celestial';
