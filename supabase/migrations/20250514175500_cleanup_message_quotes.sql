-- Remove legacy wrapping quotes from existing rows
UPDATE messages
SET    text = substring(text FROM 2 FOR char_length(text) - 2)
WHERE  char_length(text) >= 2
  AND ((left(text,1) = '"' AND right(text,1) = '"')
       OR (left(text,1) = '''' AND right(text,1) = ''''));

-- Guard against future bad inserts
ALTER TABLE messages
ADD CONSTRAINT messages_text_no_wrapping_quotes
CHECK (
  NOT (
    (left(text,1) = '"' AND right(text,1) = '"')
    OR
    (left(text,1) = '''' AND right(text,1) = '''')
  )
);
