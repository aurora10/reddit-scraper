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
import { type RedditPost } from "@/lib/reddit"

type SortField = 'score' | 'created_utc' | 'num_comments'
type SortDirection = 'asc' | 'desc'

interface PostsTableProps {
  posts: RedditPost[]
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPosts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium">
                <a 
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600"
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
