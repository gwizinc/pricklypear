
ALTER TABLE messages ADD COLUMN kind_text TEXT;
ALTER TABLE messages ADD COLUMN selected_text TEXT;

UPDATE messages SET kind_text = text, selected_text = text;

ALTER TABLE messages DROP COLUMN text;

CREATE OR REPLACE VIEW messages_view AS
SELECT 
  m.id as message_id,
  m.conversation_id,
  m.sender_profile_id as profile_id,
  p.full_name as profile_name,
  m.kind_text,
  m.selected_text,
  m.timestamp,
  m.is_system
FROM messages m
LEFT JOIN profiles p ON m.sender_profile_id = p.id;
