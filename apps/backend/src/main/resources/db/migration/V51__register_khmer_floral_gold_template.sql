-- New dedicated free renderer. Never repoint invitations or overwrite an Admin record.
INSERT INTO templates (name, code, category, description, thumbnail_url, preview_url,
    is_premium, price, currency, status, sort_order, created_at, updated_at)
SELECT 'សិរីមង្គលផ្កាមាស / Khmer Floral Gold', 'khmer-floral-gold', 'TRADITIONAL',
    '{"presetId":"KHMER_FLORAL_GOLD","theme":"KHMER_FLORAL_GOLD","languageMode":"KH","primaryColor":"#876326","secondaryColor":"#d5b77a","backgroundColor":"#fffdf8","openingStyle":"floral-paper","enabledSections":{"family":true,"invitation":true,"couplePhoto":true,"countdown":true,"schedule":true,"map":true,"gallery":true,"closing":true,"rsvp":true,"music":true,"story":false,"faq":false,"dressCode":false,"gift":false,"party":false}}',
    '/templates/khmer-floral-gold/preview.svg', '/templates/khmer-floral-gold/demo',
    FALSE, 0.00, 'USD', 'ACTIVE', 3, NOW(6), NOW(6)
WHERE NOT EXISTS (SELECT 1 FROM templates WHERE code = 'khmer-floral-gold');

INSERT INTO template_event_types (template_id, event_type)
SELECT t.template_id, 'WEDDING' FROM templates t WHERE t.code = 'khmer-floral-gold'
AND NOT EXISTS (SELECT 1 FROM template_event_types e WHERE e.template_id = t.template_id AND e.event_type = 'WEDDING');

INSERT INTO template_languages (template_id, language_mode)
SELECT t.template_id, l.language_mode FROM templates t
CROSS JOIN (SELECT 'KH' AS language_mode UNION ALL SELECT 'EN' UNION ALL SELECT 'BOTH') l
WHERE t.code = 'khmer-floral-gold'
AND NOT EXISTS (SELECT 1 FROM template_languages x WHERE x.template_id = t.template_id AND x.language_mode = l.language_mode);
