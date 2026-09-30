-- Add color columns to templates table
ALTER TABLE templates
    ADD COLUMN primary_color VARCHAR(50) NULL AFTER status,
    ADD COLUMN secondary_color VARCHAR(50) NULL AFTER primary_color,
    ADD COLUMN background_color VARCHAR(50) NULL AFTER secondary_color;

-- Seed default colors for built-in templates matching their existing design
UPDATE templates
SET primary_color = '#541722',
    secondary_color = '#B88A3A',
    background_color = '#F7F0E4'
WHERE code = 'khmer-celestial';

UPDATE templates
SET primary_color = '#f9af59',
    secondary_color = '#B08E4F',
    background_color = '#FFFDF7'
WHERE code = 'royal-khmer-wedding';

UPDATE templates
SET primary_color = '#8B9D83',
    secondary_color = '#5A7156',
    background_color = '#F4F7F2'
WHERE code = 'garden-royal-khmer-wedding';

UPDATE templates
SET primary_color = '#D4AF37',
    secondary_color = '#F3E5AB',
    background_color = '#0B1220'
WHERE code = 'the-digital-yes-wedding';

UPDATE templates
SET primary_color = '#0F5132',
    secondary_color = '#D4AF37',
    background_color = '#082115'
WHERE code = 'emerald-canva-luxe-wedding';

UPDATE templates
SET primary_color = '#f9af59',
    secondary_color = '#B08E4F',
    background_color = '#FFFDF7'
WHERE code = 'koupreng-demo-wedding';
