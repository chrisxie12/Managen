ALTER TABLE permissions DROP CONSTRAINT IF EXISTS permissions_module_action_key;
DELETE FROM permissions WHERE action IS NULL OR action = '';
