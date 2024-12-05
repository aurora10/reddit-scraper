'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RedditPost } from "@/lib/reddit"
import { PostCategory } from "@/lib/openai"
import { PostsTable } from "@/components/PostsTable"

interface ThemeAnalysisProps {
  posts: (RedditPost & { analysis: PostCategory })[]
}

interface ThemeCardProps {
  title: string
  description: string
  posts: (RedditPost & { analysis: PostCategory })[]
  filterFn: (post: RedditPost & { analysis: PostCategory }) => boolean
  isSelected: boolean
  onClick: () => void
}

function ThemeCard({ title, description, posts, filterFn, isSelected, onClick }: ThemeCardProps) {
  const matchingPosts = posts.filter(filterFn)
  
  return (
    <Card 
      className={`cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'border-blue-500 border-2' : ''}`}
      onClick={onClick}
    >
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
  )
}

export function ThemeAnalysis({ posts }: ThemeAnalysisProps) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)

  const themes = [
    {
      id: 'solution',
      title: 'Solution Requests',
      description: 'Posts seeking solutions to problems',
      filterFn: (post: RedditPost & { analysis: PostCategory }) => post.analysis.isSolutionRequest
    },
    {
      id: 'pain',
      title: 'Pain & Anger',
      description: 'Posts expressing frustration or anger',
      filterFn: (post: RedditPost & { analysis: PostCategory }) => post.analysis.isPainOrAnger
    },
    {
      id: 'advice',
      title: 'Advice Requests',
      description: 'Posts seeking advice',
      filterFn: (post: RedditPost & { analysis: PostCategory }) => post.analysis.isAdviceRequest
    },
    {
      id: 'money',
      title: 'Money Talk',
      description: 'Posts discussing financial aspects',
      filterFn: (post: RedditPost & { analysis: PostCategory }) => post.analysis.isMoneyTalk
    }
  ]

  const selectedThemeData = themes.find(theme => theme.id === selectedTheme)
  const filteredPosts = selectedThemeData 
    ? posts.filter(selectedThemeData.filterFn)
    : []

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themes.map(theme => (
          <ThemeCard
            key={theme.id}
            title={theme.title}
            description={theme.description}
            posts={posts}
            filterFn={theme.filterFn}
            isSelected={selectedTheme === theme.id}
            onClick={() => setSelectedTheme(selectedTheme === theme.id ? null : theme.id)}
          />
        ))}
      </div>

      {selectedTheme && selectedThemeData && filteredPosts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{selectedThemeData.title} Posts</h2>
          <PostsTable posts={filteredPosts} />
        </div>
      )}
    </div>
  )
}
