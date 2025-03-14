-- Add user_id column to posts table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE posts ADD COLUMN user_id UUID REFERENCES auth.users (id);
    END IF;
END $$;

-- Add user_id column to post_analyses table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'post_analyses' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE post_analyses ADD COLUMN user_id UUID REFERENCES auth.users (id);
    END IF;
END $$;

-- Add RLS policies for posts table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Users can create their own posts'
        AND polrelid = 'posts'::regclass
    ) THEN
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
    END IF;
END $$;

-- Add RLS policies for post_analyses table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Users can create their own analyses'
        AND polrelid = 'post_analyses'::regclass
    ) THEN
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
    END IF;
END $$;

-- Add RLS policies for subreddits table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Users can create their own subreddits'
        AND polrelid = 'subreddits'::regclass
    ) THEN
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
    END IF;
END $$;
