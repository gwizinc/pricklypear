-- Re-wrap message text in double quotes if it is not already wrapped
UPDATE messages
SET    text = '"' || text || '"'
WHERE  text NOT LIKE '"%"';
