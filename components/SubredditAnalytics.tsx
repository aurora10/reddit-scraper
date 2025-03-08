'use client'

import { useState } from 'react'
import { useSubredditData } from '../hooks/useSubredditData'
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card"
import { 
  BarChart, TrendingUp, MessageSquare, RefreshCw, AlertCircle, 
  ThumbsUp, ThumbsDown, Meh, Search, Tag, Award, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// Define tab types
type TabType = 'overview' | 'thematic-analysis' | 'posts'

export function SubredditAnalytics({ subredditName }: { subredditName: string }) {
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  const { 
    data, 
    isLoadingInitial, 
    isRefreshing, 
    refreshData, 
    isRefreshNeeded,
    error 
  } = useSubredditData(subredditName)
  
  // Function to handle category selection and tab switching
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setActiveTab('thematic-analysis')
  }
  
  if (isLoadingInitial) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full rounded-md" />
      </div>
    )
  }
  
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">{error.message || 'Failed to load subreddit data'}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => refreshData()}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    )
  }
  
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Data</CardTitle>
          <CardDescription>No analytics data found for r/{subredditName}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Click the button below to analyze this subreddit.</p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => refreshData()} 
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Analyze Subreddit
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    )
  }
  
  // Check if thematic analysis data exists
  const thematicAnalysis = data.analysis_results.thematicAnalysis
  
  // Get all posts for the selected category
  const postsInSelectedCategory = selectedCategory && thematicAnalysis
    ? thematicAnalysis.categorizedPosts.filter(post => 
        post.categories.includes(selectedCategory)
      )
    : []
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6 text-orange-500" />
            r/{data.display_name}
          </h2>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Last updated: {new Date(data.last_updated).toLocaleString()}
          </p>
        </div>
        <Button 
          onClick={() => refreshData()} 
          disabled={isRefreshing}
          variant={isRefreshNeeded ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              {isRefreshNeeded ? 'Update Available' : 'Refresh Data'}
            </>
          )}
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="thematic-analysis" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Thematic Analysis
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            All Posts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Top Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.analysis_results.topKeywords.map(({ word, count }) => (
                    <Badge key={word} variant="secondary" className="text-sm">
                      {word} ({count})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Sentiment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-lg font-medium mb-4">
                    Overall: {data.analysis_results.sentimentScore.average > 0 ? 'Positive' : 'Negative'}
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center">
                      <ThumbsUp className="h-8 w-8 text-green-500 mb-2" />
                      <div className="font-bold text-xl text-green-500">
                        {data.analysis_results.sentimentScore.distribution.positive}%
                      </div>
                      <div className="text-xs">Positive</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <Meh className="h-8 w-8 text-yellow-500 mb-2" />
                      <div className="font-bold text-xl text-yellow-500">
                        {data.analysis_results.sentimentScore.distribution.neutral}%
                      </div>
                      <div className="text-xs">Neutral</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <ThumbsDown className="h-8 w-8 text-red-500 mb-2" />
                      <div className="font-bold text-xl text-red-500">
                        {data.analysis_results.sentimentScore.distribution.negative}%
                      </div>
                      <div className="text-xs">Negative</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-indigo-500" />
                  Post Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center justify-center">
                  <MessageSquare className="h-10 w-10 text-indigo-500 mb-2" />
                  <p className="text-3xl font-bold">{data.post_count}</p>
                  <p className="text-sm text-gray-500">Total Posts</p>
                </div>
              </CardContent>
            </Card>
            
            {thematicAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-purple-500" />
                    Thematic Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(thematicAnalysis.categoryCounts).map(([category, count]) => (
                      <Button 
                        key={category} 
                        variant="outline"
                        className="h-auto flex flex-col items-center p-4 hover:bg-gray-50 hover:border-purple-200 transition-colors"
                        onClick={() => handleCategorySelect(category)}
                      >
                        <p className="font-medium text-purple-700">{category}</p>
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-xs text-gray-500">posts</p>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="thematic-analysis" className="mt-6">
          {thematicAnalysis && (
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-purple-500" />
                    Thematic Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(thematicAnalysis.categoryCounts).map(([category, count]) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="rounded-full"
                      >
                        {category} ({count})
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {selectedCategory ? (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-purple-500" />
                        Posts in "{selectedCategory}"
                      </CardTitle>
                      <CardDescription>
                        {postsInSelectedCategory.length} posts found
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                    >
                      Clear selection
                    </Button>
                  </CardHeader>
                  
                  <CardContent>
                    {postsInSelectedCategory.length > 0 ? (
                      <div className="divide-y">
                        {postsInSelectedCategory.map(post => (
                          <div key={post.id} className="py-4">
                            <a
                              href={post.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-lg font-medium text-blue-600 hover:underline"
                            >
                              {post.title}
                            </a>
                            <div className="flex gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {post.score} points
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {post.num_comments} comments
                              </span>
                              <span className="flex items-center gap-1">
                                <RefreshCw className="h-3 w-3" />
                                {new Date(post.created_utc * 1000).toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {post.categories.map(cat => (
                                <Badge 
                                  key={cat} 
                                  variant={cat === selectedCategory ? "default" : "secondary"}
                                >
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-8 bg-gray-50 rounded-md">
                        <p>No posts found in this category.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-50">
                  <CardContent className="text-center p-8">
                    <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select a category to view posts.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="posts" className="mt-6">
          {thematicAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  All Posts
                </CardTitle>
                <CardDescription>
                  {thematicAnalysis.categorizedPosts.length} posts from r/{data.display_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {thematicAnalysis.categorizedPosts.map(post => (
                    <div key={post.id} className="py-4">
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-medium text-blue-600 hover:underline"
                      >
                        {post.title}
                      </a>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {post.score} points
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post.num_comments} comments
                        </span>
                        <span className="flex items-center gap-1">
                          <RefreshCw className="h-3 w-3" />
                          {new Date(post.created_utc * 1000).toLocaleString()}
                        </span>
                      </div>
                      {post.categories.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {post.categories.map(category => (
                            <Badge 
                              key={category} 
                              variant="secondary"
                              className="cursor-pointer hover:bg-gray-200"
                              onClick={() => handleCategorySelect(category)}
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 