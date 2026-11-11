Deployed Edge Function `manage-users` (verify_jwt on). Only active admins may call it.
Actions: `list`, `create`, `update` (name, username, role, properties, active),
`reset_password`, `delete`. Guards: admins can't demote, limit, disable or delete
themselves, and the last active admin can't be removed.
Source: Supabase dashboard → Edge Functions → manage-users.
