'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Link from "next/link"
import type { Subreddit } from "@/lib/db"

interface SubredditCardProps {
  subreddit: Subreddit
}

export function SubredditCard({ subreddit }: SubredditCardProps) {
  // Format the last fetched time
  const lastFetchedText = subreddit.last_fetched_at 
    ? new Date(subreddit.last_fetched_at).toLocaleString()
    : 'Never'

  return (
    <Link href={`/subreddit/${subreddit.name}`}>
      <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
        <CardHeader>
          <CardTitle>r/{subreddit.display_name}</CardTitle>
          <CardDescription>
            Last updated: {lastFetchedText}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">
            Added: {new Date(subreddit.created_at).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
