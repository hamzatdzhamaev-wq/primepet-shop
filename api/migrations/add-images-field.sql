-- Add images field to products table
-- This will store an array of image URLs as JSON

ALTER TABLE products
ADD COLUMN IF NOT EXISTS images TEXT;

-- Update existing products: convert single image to array format
UPDATE products
SET images = CASE
    WHEN image IS NOT NULL AND image != '' THEN json_build_array(image)::text
    ELSE '[]'
END
WHERE images IS NULL;
