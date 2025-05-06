
ALTER TABLE messages ADD COLUMN text TEXT;

UPDATE messages SET text = selected_text;

ALTER TABLE messages DROP COLUMN kind_text;
ALTER TABLE messages DROP COLUMN selected_text;

CREATE OR REPLACE VIEW messages_view AS
SELECT 
  m.id as message_id,
  m.conversation_id,
  m.sender_profile_id as profile_id,
  p.full_name as profile_name,
  m.text,
  m.timestamp,
  m.is_system
FROM messages m
LEFT JOIN profiles p ON m.sender_profile_id = p.id;
