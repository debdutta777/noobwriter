-- Quick fix to publish the existing novel
UPDATE series
SET is_published = true
WHERE id = 'c30379a7-0e57-43c2-97d9-0bd6ec9683b2';

-- Verify
SELECT id, title, status, is_published 
FROM series 
WHERE id = 'c30379a7-0e57-43c2-97d9-0bd6ec9683b2';
