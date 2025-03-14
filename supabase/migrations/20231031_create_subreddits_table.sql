-- Create subreddits table
CREATE TABLE IF NOT EXISTS subreddits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS subreddits_name_idx ON subreddits (name);
CREATE INDEX IF NOT EXISTS subreddits_user_id_idx ON subreddits (user_id);

-- Enable RLS
ALTER TABLE subreddits ENABLE ROW LEVEL SECURITY;
