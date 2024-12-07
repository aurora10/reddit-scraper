"use client";

import { useState, useEffect } from "react";
import { supabase } from '../lib/supabase-client';
import { SignInButton } from "../components/SignInButton";
import { SignOutButton } from "../components/SignOutButton";
import { SubredditCard } from "../components/SubredditCard";
import { AddSubredditModal } from "../components/AddSubredditModal";
import type { Subreddit } from "../lib/db";

export default function HomePage() {
  const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session) {
        // Clear subreddits when user signs out
        setSubreddits([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchSubreddits() {
      if (!user) return;

      const { data, error } = await supabase
        .from('subreddits')
        .select('*');
      
      if (error) {
        console.error('Error fetching subreddits:', error);
        return;
      }

      setSubreddits(data || []);
    }

    fetchSubreddits();
  }, [user]);

  const handleAddSubreddit = (subreddit: Subreddit) => {
    setSubreddits(prev => [...prev, subreddit]);
  };

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  return (
    <main className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Reddit Analytics Platform</h1>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-sm text-gray-600">
                {user.email}
              </span>
              <AddSubredditModal onAdd={handleAddSubreddit} />
              <SignOutButton />
            </>
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
      
      {user ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subreddits.map((subreddit) => (
            <SubredditCard
              key={subreddit.id}
              subreddit={subreddit}
            />
          ))}
          {subreddits.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No subreddits added yet. Click "Add Subreddit" to get started.
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl mb-4">Welcome to Reddit Analytics Platform</h2>
          <p className="text-gray-600">Please sign in to start tracking subreddits.</p>
        </div>
      )}
    </main>
  );
}
