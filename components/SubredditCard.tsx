// 'use client'

// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
// import Link from "next/link"
// import type { Subreddit } from "@/lib/db"

// interface SubredditCardProps {
//   subreddit: Subreddit
// }

// export function SubredditCard({ subreddit }: SubredditCardProps) {
//   // Format the last fetched time
//   const lastFetchedText = subreddit.last_fetched_at 
//     ? new Date(subreddit.last_fetched_at).toLocaleString()
//     : 'Never'

//   return (
//     <Link href={`/subreddit/${subreddit.name}`}>
//       <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
//         <CardHeader>
//           <CardTitle>r/{subreddit.display_name}</CardTitle>
//           <CardDescription>
//             Last updated: {lastFetchedText}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="text-sm text-gray-500">
//             Added: {new Date(subreddit.created_at).toLocaleDateString()}
//           </div>
//         </CardContent>
//       </Card>
//     </Link>
//   )
// }
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
      <Card className="bg-navy-700 text-white hover:bg-gradient-to-br from-navy-800 to-navy-900 cursor-pointer transition-colors border border-blue-500">
        <CardHeader>
          <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">r/{subreddit.display_name}</CardTitle>
          <CardDescription className="text-gray-300">
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
