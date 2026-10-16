-- V36__add_public_visible_to_packages.sql
-- Add public visibility control to packages table for public catalog exposure

ALTER TABLE packages
    ADD COLUMN public_visible BOOLEAN NOT NULL DEFAULT FALSE AFTER active,
    ADD INDEX idx_packages_public_visible (public_visible, active, sort_order);

-- Publish standard active packages verified by payment plan resolver
UPDATE packages
SET public_visible = TRUE
WHERE code IN ('BASIC', 'PRO', 'PREMIUM') AND active = TRUE;

