-- Support bounded event guest pages in their stable newest-first order.
-- The existing invitation/email uniqueness index cannot satisfy this ordering.
CREATE INDEX idx_guests_invitation_created_id ON guests (invitation_id, created_at, guest_id);
