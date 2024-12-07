-- Add user_id column to posts table
ALTER TABLE posts ADD COLUMN user_id UUID REFERENCES auth.users (id);

-- Add user_id column to post_analyses table
ALTER TABLE post_analyses
ADD COLUMN user_id UUID REFERENCES auth.users (id);

-- Add RLS policies for posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own posts" ON posts FOR
INSERT
    TO authenticated
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can view their own posts" ON posts FOR
SELECT TO authenticated USING (auth.uid () = user_id);

CREATE POLICY "Users can update their own posts" ON posts FOR
UPDATE TO authenticated USING (auth.uid () = user_id);

-- Add RLS policies for post_analyses table
ALTER TABLE post_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own analyses" ON post_analyses FOR
INSERT
    TO authenticated
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can view their own analyses" ON post_analyses FOR
SELECT TO authenticated USING (auth.uid () = user_id);

CREATE POLICY "Users can update their own analyses" ON post_analyses FOR
UPDATE TO authenticated USING (auth.uid () = user_id);

-- Add RLS policies for subreddits table if not already present
ALTER TABLE subreddits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own subreddits" ON subreddits FOR
INSERT
    TO authenticated
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can view their own subreddits" ON subreddits FOR
SELECT TO authenticated USING (auth.uid () = user_id);

CREATE POLICY "Users can update their own subreddits" ON subreddits FOR
UPDATE TO authenticated USING (auth.uid () = user_id);