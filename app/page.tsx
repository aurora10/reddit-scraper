"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SignInButton } from "@/components/SignInButton";
import { SignOutButton } from "@/components/SignOutButton";
import { SubredditCard } from "@/components/SubredditCard";
import { AddSubredditModal } from "@/components/AddSubredditModal";
import type { Database } from "@/lib/types";
import type { Subreddit } from "@/lib/types";
import { User } from '@supabase/supabase-js';

export default function HomePage() {
  const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const auth = supabase.auth;
    // Check for existing session
    auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session) {
        // Clear subreddits when user signs out
        setSubreddits([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

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
  }, [user, supabase, refreshTrigger]);

  const handleAddSubreddit = (subreddit: Subreddit) => {
    setSubreddits(prev => [...prev, subreddit]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-300 mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-bold mb-4 md:mb-0 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
            Reddit Analyzer
          </h1>
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <span className="text-sm text-blue-200">
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
          subreddits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subreddits.map((subreddit) => (
                <SubredditCard
                  key={subreddit.id}
                  subreddit={subreddit}
                  onDelete={() => setRefreshTrigger(prev => prev + 1)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-navy-800 bg-opacity-50 rounded-lg shadow-xl p-8 max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-semibold mb-4 text-blue-300">
                No subreddits yet
              </h2>
              <p className="text-blue-200 mb-4">
                Click &quot;Add Subreddit&quot; to start analyzing Reddit communities
              </p>
            </div>
          )
        ) : (
          <div className="bg-navy-800 bg-opacity-50 rounded-lg shadow-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-blue-300">
              How to use:
            </h2>
            <ol className="text-left space-y-4 text-blue-100">
              <li>1. Sign in to enable full analysis features</li>
              <li>2. Add subreddits you want to analyze</li>
              <li>3. View posts and their categorizations</li>
              <li>4. Explore themes and patterns in the content</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
