-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;

DROP POLICY IF EXISTS "Users can update their own data" ON users;

DROP POLICY IF EXISTS "Users can insert their own data" ON users;

-- Create new policies for users table
CREATE POLICY "Enable insert for authenticated users inserting their own data" ON users FOR
INSERT
WITH
    CHECK (auth.uid () = id);

CREATE POLICY "Enable select for users accessing their own data" ON users FOR
SELECT USING (auth.uid () = id);

CREATE POLICY "Enable update for users updating their own data" ON users FOR
UPDATE USING (auth.uid () = id)
WITH
    CHECK (auth.uid () = id);

-- Drop existing policies for subreddits
DROP POLICY IF EXISTS "Users can view their own subreddits" ON subreddits;

DROP POLICY IF EXISTS "Users can insert their own subreddits" ON subreddits;

-- Create new policies for subreddits table
CREATE POLICY "Enable insert for authenticated users" ON subreddits FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Enable select for authenticated users accessing their own subreddits" ON subreddits FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Enable update for users updating their own subreddits" ON subreddits FOR
UPDATE USING (auth.uid () = user_id)
WITH
    CHECK (auth.uid () = user_id);

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

ALTER TABLE subreddits ENABLE ROW LEVEL SECURITY;

-- Allow public to create users (needed for registration)
ALTER TABLE users FORCE ROW LEVEL SECURITY;