CREATE TABLE template_event_types (
    template_id BIGINT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    PRIMARY KEY (template_id, event_type),
    CONSTRAINT fk_template_event_types_template FOREIGN KEY (template_id) REFERENCES templates(template_id),
    CONSTRAINT ck_template_event_types_type CHECK (event_type IN ('WEDDING','ENGAGEMENT','BIRTHDAY','ANNIVERSARY','CORPORATE','OTHER'))
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE template_languages (
    template_id BIGINT NOT NULL,
    language_mode VARCHAR(20) NOT NULL,
    PRIMARY KEY (template_id, language_mode),
    CONSTRAINT fk_template_languages_template FOREIGN KEY (template_id) REFERENCES templates(template_id),
    CONSTRAINT ck_template_languages_mode CHECK (language_mode IN ('KH','EN','BOTH'))
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Only classify renderers inspected in this release. Unknown/custom templates
-- remain unclassified until their editor and public rendering are verified.
INSERT INTO template_event_types (template_id, event_type)
SELECT template_id, 'WEDDING' FROM templates
WHERE code IN ('silk-heritage', 'khmer-celestial', 'royal-khmer-wedding');

INSERT INTO template_languages (template_id, language_mode)
SELECT t.template_id, l.language_mode FROM templates t
CROSS JOIN (SELECT 'KH' AS language_mode UNION ALL SELECT 'EN' UNION ALL SELECT 'BOTH') l
WHERE t.code IN ('silk-heritage', 'khmer-celestial', 'royal-khmer-wedding');

ALTER TABLE invitations ADD COLUMN client_request_id VARCHAR(36) NULL;
CREATE UNIQUE INDEX uk_invitations_owner_request ON invitations (user_id, client_request_id);

-- A neutral renderer with an event-aware details editor; existing wedding
-- templates and invitations keep their dedicated layouts.
INSERT INTO templates (name, code, category, description, thumbnail_url, preview_url,
    is_premium, price, currency, status, sort_order, created_at, updated_at)
VALUES ('កម្មវិធីរបស់អ្នក / Event Essential', 'event-essential', 'MINIMALIST',
    'Event-aware invitation for celebrations and business gatherings.',
    '/templates/event-essential.svg', '/templates/event-essential', FALSE, 0.00, 'USD', 'ACTIVE', 20, NOW(6), NOW(6));

INSERT INTO template_event_types (template_id, event_type)
SELECT t.template_id, e.event_type FROM templates t
CROSS JOIN (SELECT 'WEDDING' AS event_type UNION ALL SELECT 'ENGAGEMENT' UNION ALL SELECT 'BIRTHDAY'
    UNION ALL SELECT 'ANNIVERSARY' UNION ALL SELECT 'CORPORATE' UNION ALL SELECT 'OTHER') e
WHERE t.code = 'event-essential';

INSERT INTO template_languages (template_id, language_mode)
SELECT t.template_id, l.language_mode FROM templates t
CROSS JOIN (SELECT 'KH' AS language_mode UNION ALL SELECT 'EN' UNION ALL SELECT 'BOTH') l
WHERE t.code = 'event-essential';
