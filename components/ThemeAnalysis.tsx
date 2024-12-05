'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RedditPost } from "@/lib/reddit"
import { PostCategory } from "@/lib/openai"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface ThemeAnalysisProps {
  posts: (RedditPost & { analysis: PostCategory })[]
}

interface ThemeCardProps {
  title: string
  description: string
  posts: (RedditPost & { analysis: PostCategory })[]
  filterFn: (post: RedditPost & { analysis: PostCategory }) => boolean
}

function ThemeCard({ title, description, posts, filterFn }: ThemeCardProps) {
  const matchingPosts = posts.filter(filterFn)
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Card className="cursor-pointer hover:bg-gray-50">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-2">{description}</p>
            <p className="text-sm font-medium">
              {matchingPosts.length} posts in this category
            </p>
          </CardContent>
        </Card>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title} Posts</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {matchingPosts.map(post => (
            <div key={post.id} className="border-b pb-4">
              <a 
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-blue-600"
              >
                {post.title}
              </a>
              <p className="text-sm text-gray-600 mt-1">
                Score: {post.score} | Comments: {post.num_comments}
              </p>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function ThemeAnalysis({ posts }: ThemeAnalysisProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ThemeCard
        title="Solution Requests"
        description="Posts seeking solutions to problems"
        posts={posts}
        filterFn={(post) => post.analysis.isSolutionRequest}
      />
      <ThemeCard
        title="Pain & Anger"
        description="Posts expressing frustration or anger"
        posts={posts}
        filterFn={(post) => post.analysis.isPainOrAnger}
      />
      <ThemeCard
        title="Advice Requests"
        description="Posts seeking advice"
        posts={posts}
        filterFn={(post) => post.analysis.isAdviceRequest}
      />
      <ThemeCard
        title="Money Talk"
        description="Posts discussing financial aspects"
        posts={posts}
        filterFn={(post) => post.analysis.isMoneyTalk}
      />
    </div>
  )
}
