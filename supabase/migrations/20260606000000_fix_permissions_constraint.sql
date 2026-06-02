-- Promote temp/fix-permissions.sql into a versioned migration.
-- Removes a unique constraint that was blocking permission upserts and
-- deletes any rows that slipped in with a NULL/empty action.

ALTER TABLE permissions DROP CONSTRAINT IF EXISTS permissions_module_action_key;
DELETE FROM permissions WHERE action IS NULL OR action = '';
