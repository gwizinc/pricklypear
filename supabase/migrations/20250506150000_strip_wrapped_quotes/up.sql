-- Strip a single pair of leading & trailing double quotes from messages.text
UPDATE messages
SET    text = regexp_replace(text, '^"(.*)"$', '\1')
WHERE  text LIKE '"%"';
