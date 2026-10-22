-- Register the Khmer Royal Lotus wedding template.
-- The template renderer lives in frontend-user and is resolved by code/presetId.

INSERT INTO templates (
    name, code, category, description, thumbnail_url, preview_url,
    is_premium, price, currency, status,
    primary_color, secondary_color, background_color,
    sort_order, created_at, updated_at
)
SELECT 'Khmer Royal Lotus',
       'khmer-royal-lotus',
       'TRADITIONAL',
       '{"presetId":"KHMER_ROYAL_LOTUS","theme":"KHMER_ROYAL_LOTUS","openingStyle":"royal-lotus-envelope","gateStyle":"royal-lotus-envelope","primaryColor":"#6B1E2B","secondaryColor":"#C8A45D","backgroundColor":"#F5EEDF","coverImage":"/facebook/all/01-card/cover-card.jpg","fontKhmer":"Kantumruy Pro","fontLatin":"Cormorant Garamond","enabledSections":{"countdown":true,"story":false,"schedule":true,"map":true,"gallery":true,"party":false,"dressCode":false,"gift":true,"faq":false,"rsvp":true,"music":true}}',
       '/facebook/all/01-card/cover-card.jpg',
       '/templates/khmer-royal-lotus',
       FALSE,
       0.00,
       'USD',
       'ACTIVE',
       '#6B1E2B',
       '#C8A45D',
       '#F5EEDF',
       2,
       NOW(6),
       NOW(6)
WHERE NOT EXISTS (
    SELECT 1 FROM templates WHERE code = 'khmer-royal-lotus'
);

-- Compatibility metadata introduced by V37 is required by event creation.
INSERT IGNORE INTO template_event_types (template_id, event_type)
SELECT template_id, 'WEDDING' FROM templates WHERE code = 'khmer-royal-lotus';

INSERT IGNORE INTO template_languages (template_id, language_mode)
SELECT t.template_id, l.language_mode FROM templates t
CROSS JOIN (SELECT 'KH' AS language_mode UNION ALL SELECT 'EN' UNION ALL SELECT 'BOTH') l
WHERE t.code = 'khmer-royal-lotus';
