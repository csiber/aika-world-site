ALTER TABLE planets ADD COLUMN specialization TEXT DEFAULT NULL;
-- Valid values: NULL (balanced), 'mining', 'military', 'research', 'trade'
