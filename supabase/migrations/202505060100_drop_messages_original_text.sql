-- 202505060100_drop_messages_original_text.sql
-- Drops the `original_text` column from the messages table and updates the
-- message_profiles view to reflect the new schema.

-- 1. Drop the column if it exists (safe in dev/preview)
ALTER TABLE IF EXISTS public.messages
  DROP COLUMN IF EXISTS original_text;

-- 2. Recreate the `message_profiles` helper view without the dropped column.
DROP VIEW IF EXISTS public.message_profiles;

CREATE VIEW public.message_profiles AS
SELECT
    m.id               AS message_id,
    m.conversation_id,
    m.sender_profile_id AS profile_id,
    p.name             AS profile_name,
    m.kind_text,
    m.selected_text,
    m.timestamp,
    m.is_system
FROM public.messages m
LEFT JOIN public.profiles p ON p.id = m.sender_profile_id;
