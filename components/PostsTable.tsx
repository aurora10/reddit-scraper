'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { PostWithAnalysis } from "@/lib/types"

type SortField = 'score' | 'created_utc' | 'num_comments'
type SortDirection = 'asc' | 'desc'

interface PostsTableProps {
  posts: PostWithAnalysis[]
}

function CategoryBadges({ post }: { post: PostWithAnalysis }) {
  if (!post.analysis) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {post.analysis.isSolutionRequest && (
        <Badge className="bg-blue-500">Solution</Badge>
      )}
      {post.analysis.isPainOrAnger && (
        <Badge className="bg-red-500">Pain</Badge>
      )}
      {post.analysis.isAdviceRequest && (
        <Badge className="bg-green-500">Advice</Badge>
      )}
      {post.analysis.isMoneyTalk && (
        <Badge className="bg-yellow-500">Money</Badge>
      )}
    </div>
  )
}

export function PostsTable({ posts }: PostsTableProps) {
  const [sortField, setSortField] = useState<SortField>('score')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedPosts = [...posts].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1
    return (a[sortField] - b[sortField]) * multiplier
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('score')}
            >
              Score {sortField === 'score' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Content</TableHead>
            <TableHead>URL</TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('created_utc')}
            >
              Creation Time {sortField === 'created_utc' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('num_comments')}
            >
              Comments {sortField === 'num_comments' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Categories</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPosts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="max-w-md">
                <a 
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:text-blue-600 block"
                >
                  {post.title}
                </a>
              </TableCell>
              <TableCell>{post.score}</TableCell>
              <TableCell>
                <a 
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600"
                >
                  View on Reddit
                </a>
              </TableCell>
              <TableCell>
                <a 
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 truncate block max-w-xs"
                >
                  {post.url}
                </a>
              </TableCell>
              <TableCell>
                {new Date(post.created_utc * 1000).toLocaleString()}
              </TableCell>
              <TableCell>{post.num_comments}</TableCell>
              <TableCell>
                <CategoryBadges post={post} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
