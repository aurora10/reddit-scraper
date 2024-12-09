// "use client";

// import { useState, useEffect } from "react";
// import { supabase } from '../lib/supabase-client';
// import { SignInButton } from "../components/SignInButton";
// import { SignOutButton } from "../components/SignOutButton";
// import { SubredditCard } from "../components/SubredditCard";
// import { AddSubredditModal } from "../components/AddSubredditModal";
// import type { Subreddit } from "../lib/db";

// export default function HomePage() {
//   const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
//   const [user, setUser] = useState<any>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // Check for existing session
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setUser(session?.user || null);
//       setIsLoading(false);
//     });

//     // Listen for auth changes
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user || null);
//       if (!session) {
//         // Clear subreddits when user signs out
//         setSubreddits([]);
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   useEffect(() => {
//     async function fetchSubreddits() {
//       if (!user) return;

//       const { data, error } = await supabase
//         .from('subreddits')
//         .select('*');
      
//       if (error) {
//         console.error('Error fetching subreddits:', error);
//         return;
//       }

//       setSubreddits(data || []);
//     }

//     fetchSubreddits();
//   }, [user]);

//   const handleAddSubreddit = (subreddit: Subreddit) => {
//     setSubreddits(prev => [...prev, subreddit]);
//   };

//   if (isLoading) {
//     return <div className="container mx-auto py-8">Loading...</div>;
//   }

//   return (
//     <main className="container mx-auto py-8">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold">Reddit Analytics Platform</h1>
//         <div className="flex gap-4 items-center">
//           {user ? (
//             <>
//               <span className="text-sm text-gray-600">
//                 {user.email}
//               </span>
//               <AddSubredditModal onAdd={handleAddSubreddit} />
//               <SignOutButton />
//             </>
//           ) : (
//             <SignInButton />
//           )}
//         </div>
//       </div>
      
//       {user ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {subreddits.map((subreddit) => (
//             <SubredditCard
//               key={subreddit.id}
//               subreddit={subreddit}
//             />
//           ))}
//           {subreddits.length === 0 && (
//             <div className="col-span-full text-center py-12 text-gray-500">
//               No subreddits added yet. Click "Add Subreddit" to get started.
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="text-center py-12">
//           <h2 className="text-xl mb-4">Welcome to Reddit Analytics Platform</h2>
//           <p className="text-gray-600">Please sign in to start tracking subreddits.</p>
//         </div>
//       )}
//     </main>
//   );
// }

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-800 to-navy-900 bg-pattern">
        <div className="animate-pulse text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-auto">
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%234a5568' fill-opacity='0.4'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundAttachment: 'fixed'
        }}
      ></div>
      <main className="relative z-10">
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <h1 className="text-4xl font-bold mb-4 md:mb-0 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
              Reddit Analytics Platform
            </h1>
            <div className="flex flex-col md:flex-row gap-4 items-center">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subreddits.map((subreddit) => (
                <SubredditCard
                  key={subreddit.id}
                  subreddit={subreddit}
                />
              ))}
              {subreddits.length === 0 && (
                <div className="col-span-full text-center py-12 text-blue-200 bg-navy-700 bg-opacity-50 rounded-lg">
                  No subreddits added yet. Click "Add Subreddit" to get started.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-navy-700 bg-opacity-50 rounded-lg shadow-xl">
              <h2 className="text-2xl mb-4 font-semibold">Welcome to Reddit Analytics Platform</h2>
              <p className="text-blue-200">Please sign in to start tracking subreddits.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

