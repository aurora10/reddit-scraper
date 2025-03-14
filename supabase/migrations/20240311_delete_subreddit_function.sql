-- Create function to delete subreddit and related data
create or replace function delete_subreddit_and_data(request_user_id uuid, subreddit_id uuid)
returns void
language plpgsql
security definer
as $$
-- Add DELETE policy check
perform set_config('role', 'authenticated', true);
begin
  -- Verify the subreddit belongs to the user
  if not exists (
    select 1 
    from subreddits 
    where subreddits.id = delete_subreddit_and_data.subreddit_id 
      and subreddits.user_id = request_user_id
  ) then
    raise exception 'Subreddit not found or unauthorized'
      using detail = format('Subreddit ID: %s, User ID: %s', subreddit_id, request_user_id);
  end if;

  -- Delete the subreddit - related records will be deleted via ON DELETE CASCADE
  delete from subreddits
  where subreddits.id = delete_subreddit_and_data.subreddit_id
    and subreddits.user_id = request_user_id;
  
  if not found then
    raise exception 'Failed to delete subreddit %', subreddit_id;
  end if;
end;
$$;
