"use client";

import { useState } from "react";
import { SubredditCard } from "@/components/SubredditCard";
import { AddSubredditModal } from "@/components/AddSubredditModal";

const INITIAL_SUBREDDITS = [
  {
    name: "ollama",
    description: "Community for Ollama - Run LLMs locally"
  },
  {
    name: "openai",
    description: "Discussion about OpenAI and its technologies"
  }
];

export default function HomePage() {
  const [subreddits, setSubreddits] = useState(INITIAL_SUBREDDITS);

  const handleAddSubreddit = (newSubreddit: { name: string; description: string }) => {
    setSubreddits((prev) => [...prev, newSubreddit]);
  };

  return (
    <main className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Reddit Analytics Platform</h1>
        <AddSubredditModal onAdd={handleAddSubreddit} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subreddits.map((subreddit) => (
          <SubredditCard
            key={subreddit.name}
            name={subreddit.name}
            description={subreddit.description}
          />
        ))}
      </div>
    </main>
  );
}
