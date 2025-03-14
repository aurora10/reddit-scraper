-- Ensure users table exists before dropping policies
DO $$
BEGIN
    PERFORM 1 FROM pg_tables WHERE tablename = 'users' AND schemaname = 'public';
    IF FOUND THEN
        -- Drop existing policies with error handling
        PERFORM 1 FROM pg_policy WHERE polname = 'Users can view their own data' AND polrelid = 'users'::regclass;
        IF FOUND THEN
            DROP POLICY "Users can view their own data" ON users;
        END IF;

        PERFORM 1 FROM pg_policy WHERE polname = 'Users can update their own data' AND polrelid = 'users'::regclass;
        IF FOUND THEN
            DROP POLICY "Users can update their own data" ON users;
        END IF;

        PERFORM 1 FROM pg_policy WHERE polname = 'Users can insert their own data' AND polrelid = 'users'::regclass;
        IF FOUND THEN
            DROP POLICY "Users can insert their own data" ON users;
        END IF;
    END IF;
END $$;

-- Create new policies for users table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Enable insert for authenticated users inserting their own data'
        AND polrelid = 'users'::regclass
    ) THEN
        CREATE POLICY "Enable insert for authenticated users inserting their own data" ON users FOR
        INSERT
        WITH
            CHECK (auth.uid () = id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Enable select for users accessing their own data'
        AND polrelid = 'users'::regclass
    ) THEN
        CREATE POLICY "Enable select for users accessing their own data" ON users FOR
        SELECT USING (auth.uid () = id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Enable update for users updating their own data'
        AND polrelid = 'users'::regclass
    ) THEN
        CREATE POLICY "Enable update for users updating their own data" ON users FOR
        UPDATE USING (auth.uid () = id)
        WITH
            CHECK (auth.uid () = id);
    END IF;
END $$;

-- Drop existing policies for subreddits
DROP POLICY IF EXISTS "Users can view their own subreddits" ON subreddits;

DROP POLICY IF EXISTS "Users can insert their own subreddits" ON subreddits;

-- Create new policies for subreddits table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Enable insert for authenticated users'
        AND polrelid = 'subreddits'::regclass
    ) THEN
        CREATE POLICY "Enable insert for authenticated users" ON subreddits FOR
        INSERT
        WITH
            CHECK (auth.uid () = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Enable select for authenticated users accessing their own subreddits'
        AND polrelid = 'subreddits'::regclass
    ) THEN
        CREATE POLICY "Enable select for authenticated users accessing their own subreddits" ON subreddits FOR
        SELECT USING (auth.uid () = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Enable update for users updating their own subreddits'
        AND polrelid = 'subreddits'::regclass
    ) THEN
        CREATE POLICY "Enable update for users updating their own subreddits" ON subreddits FOR
        UPDATE USING (auth.uid () = user_id)
        WITH
            CHECK (auth.uid () = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Enable delete for users deleting their own subreddits'
        AND polrelid = 'subreddits'::regclass
    ) THEN
        CREATE POLICY "Enable delete for users deleting their own subreddits" ON subreddits FOR
        DELETE USING (auth.uid () = user_id);
    END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

ALTER TABLE subreddits ENABLE ROW LEVEL SECURITY;

-- Allow public to create users (needed for registration)
ALTER TABLE users FORCE ROW LEVEL SECURITY;
