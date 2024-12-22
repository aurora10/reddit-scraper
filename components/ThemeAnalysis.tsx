'use client'

import { useState } from 'react'
import { PostWithAnalysis } from '@/lib/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

interface ThemeAnalysisProps {
  posts: PostWithAnalysis[]
}

const categoryColors = {
  'Solution Requests': 'bg-green-500',
  'Pain & Anger': 'bg-red-500',
  'Advice Requests': 'bg-blue-500',
  'Money Talk': 'bg-yellow-500'
} as const

type CategoryKey = keyof typeof categoryColors

export function ThemeAnalysis({ posts }: ThemeAnalysisProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null)
  const analyzedPosts = posts.filter(post => post.analysis)
  
  const categories = {
    'Solution Requests': analyzedPosts.filter(post => post.analysis?.isSolutionRequest),
    'Pain & Anger': analyzedPosts.filter(post => post.analysis?.isPainOrAnger),
    'Advice Requests': analyzedPosts.filter(post => post.analysis?.isAdviceRequest),
    'Money Talk': analyzedPosts.filter(post => post.analysis?.isMoneyTalk),
  }

  const total = analyzedPosts.length

  const getFilteredPosts = () => {
    if (!selectedCategory) return []
    return categories[selectedCategory]
  }

  const getRedditUrl = (permalink: string) => {
    if (permalink.startsWith('https://')) {
      return permalink;
    }
    if (permalink.startsWith('/r/')) {
      return `https://reddit.com${permalink}`;
    }
    return `https://reddit.com/${permalink.replace(/^\/+/, '')}`;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {Object.entries(categories).map(([category, posts]) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(selectedCategory === category as CategoryKey ? null : category as CategoryKey)}
            className={`w-full text-left transition-colors ${
              selectedCategory === category ? 'ring-2 ring-blue-400' : ''
            }`}
          >
            <div className="bg-navy-700 p-4 rounded-lg hover:bg-navy-600">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${categoryColors[category as CategoryKey]}`} />
                  <h3 className="font-medium text-white">{category}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-300">{posts.length} posts</span>
                  <span className="text-sm text-blue-300">
                    ({total > 0 ? Math.round((posts.length / total) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-navy-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${categoryColors[category as CategoryKey]}`}
                  style={{ width: `${total > 0 ? (posts.length / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedCategory && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-blue-300">
            {selectedCategory} Posts
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredPosts().map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>
                    <a 
                      href={getRedditUrl(post.permalink)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      View Post
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

