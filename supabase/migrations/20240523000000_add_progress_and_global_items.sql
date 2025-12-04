-- Create types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category') THEN
        CREATE TYPE category AS ENUM ('adventures', 'places', 'cuisines', 'books', 'songs', 'monuments', 'acts-of-service', 'miscellaneous');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty') THEN
        CREATE TYPE difficulty AS ENUM ('easy', 'medium', 'hard');
    END IF;
END$$;

-- Add progress tracking columns to bucket_items
ALTER TABLE bucket_items
ADD COLUMN IF NOT EXISTS current_value INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_value INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unit_type TEXT;

-- Create global_items table for curated catalog
CREATE TABLE IF NOT EXISTS global_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category category NOT NULL,
  points INTEGER DEFAULT 0,
  difficulty difficulty DEFAULT 'medium',
  location TEXT,
  target_value INTEGER DEFAULT 0,
  unit_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE global_items ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read global items
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'global_items' AND policyname = 'Everyone can read global items'
    ) THEN
        CREATE POLICY "Everyone can read global items" ON global_items FOR SELECT USING (true);
    END IF;
END
$$;


-- Seed data for global_items
INSERT INTO global_items (title, description, category, points, difficulty, location, target_value, unit_type) VALUES
('Visit Tokyo', 'Explore the vibrant capital of Japan', 'places', 100, 'medium', 'Japan', 0, NULL),
('Climb Mount Everest', 'Summit the world''s highest peak', 'adventures', 300, 'hard', 'Nepal', 0, NULL),
('Learn to Scuba Dive', 'Get certified for underwater exploration', 'adventures', 150, 'medium', NULL, 0, NULL),
('Eat authentic Pad Thai', 'Experience Thai street food culture', 'cuisines', 50, 'easy', 'Thailand', 0, NULL),
('Read The Great Gatsby', 'Classic American literature', 'books', 75, 'easy', NULL, 9, 'chapters'),
('Write a novel', 'Complete a full-length book', 'miscellaneous', 500, 'hard', NULL, 0, NULL),
('Run a Marathon', 'Complete a 42.195km run', 'adventures', 200, 'hard', NULL, 42, 'km'),
('Learn to Play Guitar', 'Master the basics of acoustic guitar', 'miscellaneous', 150, 'medium', NULL, 0, NULL),
('Visit the Eiffel Tower', 'See the Iron Lady in Paris', 'places', 80, 'easy', 'France', 0, NULL),
('Read 1984', 'George Orwell''s dystopian masterpiece', 'books', 80, 'medium', NULL, 24, 'chapters');
