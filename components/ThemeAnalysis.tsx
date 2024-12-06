'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostsTable } from "@/components/PostsTable"
import type { Post, PostAnalysis } from "@/lib/db"

interface PostWithAnalysis extends Post {
  post_analyses?: PostAnalysis[]
  analysis?: {
    isSolutionRequest: boolean
    isPainOrAnger: boolean
    isAdviceRequest: boolean
    isMoneyTalk: boolean
  }
}

interface ThemeAnalysisProps {
  posts: PostWithAnalysis[]
}

interface ThemeCardProps {
  title: string
  description: string
  posts: PostWithAnalysis[]
  filterFn: (post: PostWithAnalysis) => boolean
  isSelected: boolean
  onClick: () => void
}

// Helper function to get analysis data regardless of source
function getAnalysis(post: PostWithAnalysis) {
  if (post.analysis) {
    return post.analysis;
  }
  if (post.post_analyses?.[0]) {
    return {
      isSolutionRequest: post.post_analyses[0].is_solution_request,
      isPainOrAnger: post.post_analyses[0].is_pain_or_anger,
      isAdviceRequest: post.post_analyses[0].is_advice_request,
      isMoneyTalk: post.post_analyses[0].is_money_talk
    };
  }
  return null;
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
      filterFn: (post: PostWithAnalysis) => {
        const analysis = getAnalysis(post);
        return analysis?.isSolutionRequest ?? false;
      }
    },
    {
      id: 'pain',
      title: 'Pain & Anger',
      description: 'Posts expressing frustration or anger',
      filterFn: (post: PostWithAnalysis) => {
        const analysis = getAnalysis(post);
        return analysis?.isPainOrAnger ?? false;
      }
    },
    {
      id: 'advice',
      title: 'Advice Requests',
      description: 'Posts seeking advice',
      filterFn: (post: PostWithAnalysis) => {
        const analysis = getAnalysis(post);
        return analysis?.isAdviceRequest ?? false;
      }
    },
    {
      id: 'money',
      title: 'Money Talk',
      description: 'Posts discussing financial aspects',
      filterFn: (post: PostWithAnalysis) => {
        const analysis = getAnalysis(post);
        return analysis?.isMoneyTalk ?? false;
      }
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
