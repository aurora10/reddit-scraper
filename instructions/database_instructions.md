# Supabase Integration Design Document

## Overview

This document outlines the database design and integration strategy for implementing Supabase in the Reddit Analytics Platform. The goal is to optimize performance by caching Reddit posts and AI analysis data, only refetching when data is older than 24 hours.

## Current file structure:

── README.md
├── app
│ ├── favicon.ico
│ ├── fonts
│ ├── globals.css
│ ├── layout.tsx
│ └── page.tsx
├── components
│ ├── AddSubredditModal.tsx
│ ├── PostsTable.tsx
│ ├── SubredditCard.tsx
│ ├── SubredditTabs.tsx
│ ├── ThemeAnalysis.tsx
│ └── ui
│ ├── badge.tsx
│ ├── button.tsx
│ ├── card.tsx
│ ├── dialog.tsx
│ ├── input.tsx
│ ├── label.tsx
│ ├── sheet.tsx
│ ├── table.tsx
│ └── tabs.tsx
├── components.json
├── instructions
│ ├── database_instructions.md
│ └── instructions.md
├── lib
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
└── tsconfig.json

## Database Schema

### 1. subreddits

Stores information about tracked subreddits.

```sql
create table subreddits (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  display_name text not null,
  last_fetched_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Index for faster lookups
create index idx_subreddit_name on subreddits(name);
```

### 2. posts

Stores Reddit posts data.

```sql
create table posts (
  id uuid primary key default uuid_generate_v4(),
  subreddit_id uuid references subreddits(id) on delete cascade,
  reddit_id text not null unique,
  title text not null,
  author text not null,
  content text,
  created_utc bigint not null,
  score integer not null,
  num_comments integer not null,
  url text not null,
  permalink text not null,
  fetched_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for common queries
create index idx_posts_subreddit on posts(subreddit_id);
create index idx_posts_created_utc on posts(created_utc);
create index idx_posts_reddit_id on posts(reddit_id);
```

### 3. post_analyses

Stores OpenAI analysis results for posts.

```sql
create table post_analyses (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts(id) on delete cascade,
  is_solution_request boolean not null,
  is_pain_or_anger boolean not null,
  is_advice_request boolean not null,
  is_money_talk boolean not null,
  analyzed_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Index for faster post lookups
create index idx_post_analyses_post on post_analyses(post_id);
```

## Data Flow & Integration Points

### 1. Subreddit Page Load Process

1. Check if subreddit exists in database:

   ```typescript
   const subreddit = await supabase
     .from("subreddits")
     .select("*")
     .eq("name", subredditName)
     .single();
   ```

2. If not found, create new subreddit entry:

   ```typescript
   const newSubreddit = await supabase
     .from("subreddits")
     .insert({ name: subredditName, display_name: subredditName })
     .select()
     .single();
   ```

3. Check if data needs refresh (older than 24 hours):
   ```typescript
   const needsRefresh =
     !subreddit.last_fetched_at ||
     new Date().getTime() - new Date(subreddit.last_fetched_at).getTime() >
       24 * 60 * 60 * 1000;
   ```

### 2. Data Fetching & Storage

When refresh is needed:

1. Fetch new posts from Reddit API
2. Store posts in database
3. Perform OpenAI analysis
4. Store analysis results
5. Update last_fetched_at timestamp

When using cached data:

1. Retrieve posts with their analyses:
   ```typescript
   const posts = await supabase
     .from("posts")
     .select(
       `
       *,
       post_analyses (*)
     `
     )
     .eq("subreddit_id", subreddit.id)
     .order("created_utc", { ascending: false });
   ```

## Integration Guidelines

### 1. Environment Setup

Add Supabase credentials to .env:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Data Migration Strategy

1. Create initial tables using provided SQL schemas
2. Add database triggers for updated_at timestamps:

   ```sql
   create function update_updated_at_column()
   returns trigger as $$
   begin
     new.updated_at = now();
     return new;
   end;
   $$ language plpgsql;

   create trigger update_subreddits_updated_at
     before update on subreddits
     for each row
     execute function update_updated_at_column();
   -- Repeat for other tables
   ```

### 3. Error Handling

Implement error handling for:

- Database connection issues
- Concurrent updates
- Data integrity constraints
- API rate limits

### 4. Performance Considerations

1. Implement batch operations for multiple posts
2. Use appropriate indexes for common queries
3. Consider implementing a cleanup job for old data
4. Use connection pooling for better performance

### 5. Security Considerations

1. Use Row Level Security (RLS) policies
2. Implement proper access control
3. Sanitize input data
4. Use prepared statements

## Type Definitions

Update your types to match the database schema:

```typescript
interface Subreddit {
  id: string;
  name: string;
  display_name: string;
  last_fetched_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Post {
  id: string;
  subreddit_id: string;
  reddit_id: string;
  title: string;
  author: string;
  content: string | null;
  created_utc: number;
  score: number;
  num_comments: number;
  url: string;
  permalink: string;
  fetched_at: string;
  created_at: string;
  updated_at: string;
}

interface PostAnalysis {
  id: string;
  post_id: string;
  is_solution_request: boolean;
  is_pain_or_anger: boolean;
  is_advice_request: boolean;
  is_money_talk: boolean;
  analyzed_at: string;
  created_at: string;
  updated_at: string;
}
```

## Testing Strategy

1. Unit Tests:

   - Database operations
   - Data transformation functions
   - Cache invalidation logic

2. Integration Tests:

   - API endpoints
   - Data refresh flows
   - Error handling

3. Performance Tests:
   - Load testing with multiple concurrent users
   - Cache hit/miss scenarios
   - Data refresh scenarios

## Monitoring Considerations

1. Track key metrics:

   - Cache hit/miss rates
   - API response times
   - Database query performance
   - Error rates

2. Set up alerts for:
   - Failed data refreshes
   - High error rates
   - Slow query performance
   - API rate limit approaches

## Future Considerations

1. Implement pagination for large subreddits
2. Add support for real-time updates
3. Implement data archiving strategy
4. Consider implementing a CDN for static content
5. Add support for multiple analysis versions
