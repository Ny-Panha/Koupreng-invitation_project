-- Register the Khmer Celestial flagship renderer without changing existing invitations.

INSERT INTO templates (
    name, code, category, description, thumbnail_url, preview_url,
    is_premium, price, currency, status, sort_order, created_at, updated_at
)
SELECT 'Khmer Celestial',
       'khmer-celestial',
       'TRADITIONAL',
       '{"presetId":"KHMER_CELESTIAL","theme":"KHMER_CELESTIAL","openingStyle":"celestial-cover","gateStyle":"celestial-cover","primaryColor":"#541722","secondaryColor":"#B88A3A","backgroundColor":"#F7F0E4","coverImage":"/facebook/all/06-card/cover-card.jpg","enabledSections":{"countdown":true,"story":true,"schedule":true,"map":true,"gallery":true,"party":false,"dressCode":true,"gift":false,"faq":false,"rsvp":true,"music":true}}',
       '/facebook/all/06-card/cover-card.jpg',
       '/templates/khmer-celestial',
       FALSE,
       0.00,
       'USD',
       'ACTIVE',
       0,
       NOW(6),
       NOW(6)
WHERE NOT EXISTS (
    SELECT 1 FROM templates WHERE code = 'khmer-celestial'
);

UPDATE templates
SET name = 'Khmer Celestial',
    category = 'TRADITIONAL',
    description = '{"presetId":"KHMER_CELESTIAL","theme":"KHMER_CELESTIAL","openingStyle":"celestial-cover","gateStyle":"celestial-cover","primaryColor":"#541722","secondaryColor":"#B88A3A","backgroundColor":"#F7F0E4","coverImage":"/facebook/all/06-card/cover-card.jpg","enabledSections":{"countdown":true,"story":true,"schedule":true,"map":true,"gallery":true,"party":false,"dressCode":true,"gift":false,"faq":false,"rsvp":true,"music":true}}',
    thumbnail_url = '/facebook/all/06-card/cover-card.jpg',
    preview_url = '/templates/khmer-celestial',
    is_premium = FALSE,
    price = 0.00,
    currency = 'USD',
    status = 'ACTIVE',
    sort_order = 0,
    updated_at = NOW(6)
WHERE code = 'khmer-celestial';

UPDATE templates
SET sort_order = 1,
    updated_at = NOW(6)
WHERE code = 'garden-royal-khmer-wedding';
