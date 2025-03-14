-- Add DELETE policy for subreddits table
create policy "Users can delete their own subreddits"
on subreddits
for delete
to authenticated
using (auth.uid() = user_id);
