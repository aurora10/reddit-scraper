'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { PostWithAnalysis } from '@/lib/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

type SortDirection = 'asc' | 'desc' | null
type SortField = 'title' | 'author' | 'categories'

export function PostsTable({ posts: initialPosts }: { posts: PostWithAnalysis[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  useEffect(() => {
    console.log('Setting up real-time subscription')
    const subscription = supabase
      .channel('post_analyses')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_analyses'
        },
        async (payload) => {
          try {
            console.log('Received analysis update:', payload)
            
            // Get the post that this analysis belongs to
            const { data: postData, error } = await supabase
              .from('posts')
              .select('*')
              .eq('id', payload.new.post_id)
              .single()

            if (error) {
              console.error('Error fetching post:', error)
              return
            }

            if (postData) {
              console.log('Found matching post:', postData)
              setPosts(currentPosts => {
                const newPosts = currentPosts.map(post => {
                  if (post.id === postData.reddit_id) {
                    console.log('Updating analysis for post:', post.title)
                    return {
                      ...post,
                      analysis: {
                        isSolutionRequest: payload.new.is_solution_request,
                        isPainOrAnger: payload.new.is_pain_or_anger,
                        isAdviceRequest: payload.new.is_advice_request,
                        isMoneyTalk: payload.new.is_money_talk
                      }
                    }
                  }
                  return post
                })
                console.log('Updated posts:', newPosts)
                return newPosts
              })
            }
          } catch (error) {
            console.error('Error processing analysis update:', error)
          }
        }
      )
      .subscribe()

    return () => {
      console.log('Cleaning up subscription')
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortField(null)
      } else {
        setSortDirection('asc')
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getCategoryCount = (post: PostWithAnalysis) => {
    if (!post.analysis) return 0
    return Object.values(post.analysis).filter(Boolean).length
  }

  const sortPosts = (postsToSort: PostWithAnalysis[]) => {
    if (!sortField || !sortDirection) return postsToSort

    return [...postsToSort].sort((a, b) => {
      if (sortField === 'categories') {
        const countA = getCategoryCount(a)
        const countB = getCategoryCount(b)
        return sortDirection === 'asc' ? countA - countB : countB - countA
      }
      
      const valueA = a[sortField].toLowerCase()
      const valueB = b[sortField].toLowerCase()
      
      if (sortDirection === 'asc') {
        return valueA.localeCompare(valueB)
      }
      return valueB.localeCompare(valueA)
    })
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️'
    if (sortDirection === 'asc') return '↑'
    if (sortDirection === 'desc') return '↓'
    return '↕️'
  }

  const sortedPosts = sortPosts(posts)

  // Calculate statistics for the overview
  const totalPosts = posts.length
  const analyzedPosts = posts.filter(post => post.analysis).length
  const stats = {
    solutionRequests: posts.filter(post => post.analysis?.isSolutionRequest).length,
    painAndAnger: posts.filter(post => post.analysis?.isPainOrAnger).length,
    adviceRequests: posts.filter(post => post.analysis?.isAdviceRequest).length,
    moneyTalk: posts.filter(post => post.analysis?.isMoneyTalk).length
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
      {/* Analysis Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-navy-700 rounded-lg">
          <h3 className="text-sm font-medium text-blue-300">Total Posts</h3>
          <p className="text-2xl font-bold text-white">{totalPosts}</p>
        </div>
        <div className="p-4 bg-navy-700 rounded-lg">
          <h3 className="text-sm font-medium text-blue-300">Analyzed Posts</h3>
          <p className="text-2xl font-bold text-white">{analyzedPosts}</p>
        </div>
        <div className="p-4 bg-navy-700 rounded-lg">
          <h3 className="text-sm font-medium text-blue-300">Solution Requests</h3>
          <p className="text-2xl font-bold text-white">{stats.solutionRequests}</p>
        </div>
        <div className="p-4 bg-navy-700 rounded-lg">
          <h3 className="text-sm font-medium text-blue-300">Pain Points</h3>
          <p className="text-2xl font-bold text-white">{stats.painAndAnger}</p>
        </div>
      </div>

      {/* Posts Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button 
                onClick={() => handleSort('title')}
                className="flex items-center gap-2 hover:text-blue-300"
              >
                Title <span className="text-sm">{getSortIcon('title')}</span>
              </button>
            </TableHead>
            <TableHead>
              <button 
                onClick={() => handleSort('author')}
                className="flex items-center gap-2 hover:text-blue-300"
              >
                Author <span className="text-sm">{getSortIcon('author')}</span>
              </button>
            </TableHead>
            <TableHead>
              <button 
                onClick={() => handleSort('categories')}
                className="flex items-center gap-2 hover:text-blue-300"
              >
                Categories <span className="text-sm">{getSortIcon('categories')}</span>
              </button>
            </TableHead>
            <TableHead>Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPosts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium">{post.title}</TableCell>
              <TableCell>{post.author}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {post.analysis ? (
                    <>
                      {post.analysis.isSolutionRequest && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-500 text-white">Solution</span>
                      )}
                      {post.analysis.isPainOrAnger && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-500 text-white">Pain</span>
                      )}
                      {post.analysis.isAdviceRequest && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-500 text-white">Advice</span>
                      )}
                      {post.analysis.isMoneyTalk && (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-500 text-white">Money</span>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-300 rounded-full border-t-transparent"></div>
                      Analyzing...
                    </div>
                  )}
                </div>
              </TableCell>
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
  )
}

