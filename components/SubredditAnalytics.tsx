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
import { AnalysisResults } from "@/lib/types"

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
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">{error.message || 'Failed to load subreddit data'}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => refreshData()} className="border-red-300 text-red-700">
            Try Again
          </Button>
        </CardFooter>
      </Card>
    )
  }
  
  if (!data) {
    return (
      <Card className="border-blue-100 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Analyze Subreddit</CardTitle>
          <CardDescription className="text-blue-600">No analytics data found for r/{subredditName}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">Click the button below to analyze this subreddit.</p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => refreshData()} 
            disabled={isRefreshing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Analyze Subreddit
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    )
  }
  
  // Add a type assertion to fix the type error
  const thematicAnalysis = (data.analysis_results as AnalysisResults).thematicAnalysis
  
  // Get all posts for the selected category
  const postsInSelectedCategory = selectedCategory && thematicAnalysis
    ? thematicAnalysis.categorizedPosts.filter(post => 
        post.categories.includes(selectedCategory)
      )
    : []
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Award className="h-6 w-6 text-orange-500" />
          r/{data.display_name}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Last updated: {new Date(data.last_updated).toLocaleString()}
        </p>
        <div className="mt-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-blue-500" />
                  Sentiment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center p-2 rounded-full mb-4 ${
                    data.analysis_results.sentimentScore.average > 0.2 ? 'bg-green-100 text-green-700' : 
                    data.analysis_results.sentimentScore.average < -0.2 ? 'bg-red-100 text-red-700' : 
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {data.analysis_results.sentimentScore.average > 0.2 ? (
                      <ThumbsUp className="h-6 w-6" />
                    ) : data.analysis_results.sentimentScore.average < -0.2 ? (
                      <ThumbsDown className="h-6 w-6" />
                    ) : (
                      <Meh className="h-6 w-6" />
                    )}
                  </div>
                  <p className="text-lg font-medium mb-2">
                    Overall: {
                      data.analysis_results.sentimentScore.average > 0.2 ? 'Positive' : 
                      data.analysis_results.sentimentScore.average < -0.2 ? 'Negative' : 
                      'Neutral'
                    }
                  </p>
                  <div className="flex justify-between items-center mt-4 text-sm">
                    <div className="flex flex-col items-center">
                      <div className="h-20 w-4 bg-gray-100 rounded-full overflow-hidden flex flex-col-reverse">
                        <div 
                          className="bg-green-500 w-full" 
                          style={{ height: `${data.analysis_results.sentimentScore.distribution.positive}%` }}
                        ></div>
                      </div>
                      <span className="mt-1 text-green-600">{data.analysis_results.sentimentScore.distribution.positive}%</span>
                      <span className="text-xs text-gray-500">Positive</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="h-20 w-4 bg-gray-100 rounded-full overflow-hidden flex flex-col-reverse">
                        <div 
                          className="bg-gray-400 w-full" 
                          style={{ height: `${data.analysis_results.sentimentScore.distribution.neutral}%` }}
                        ></div>
                      </div>
                      <span className="mt-1 text-gray-600">{data.analysis_results.sentimentScore.distribution.neutral}%</span>
                      <span className="text-xs text-gray-500">Neutral</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="h-20 w-4 bg-gray-100 rounded-full overflow-hidden flex flex-col-reverse">
                        <div 
                          className="bg-red-500 w-full" 
                          style={{ height: `${data.analysis_results.sentimentScore.distribution.negative}%` }}
                        ></div>
                      </div>
                      <span className="mt-1 text-red-600">{data.analysis_results.sentimentScore.distribution.negative}%</span>
                      <span className="text-xs text-gray-500">Negative</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Top Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.analysis_results.topKeywords.slice(0, 15).map(keyword => (
                    <Badge 
                      key={keyword.word} 
                      variant="secondary"
                      className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200"
                      style={{ 
                        fontSize: `${Math.max(0.7, Math.min(1.2, 0.8 + keyword.count / 50))}rem`,
                        opacity: Math.max(0.7, Math.min(1, 0.7 + keyword.count / 100))
                      }}
                    >
                      {keyword.word}
                    </Badge>
                  ))}
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
                        className="h-auto flex flex-col items-center p-4 hover:bg-purple-50 hover:border-purple-300"
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
                        Posts in &quot;{selectedCategory}&quot;
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
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No posts found in this category.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-6 text-center">
                  <Tag className="h-10 w-10 mx-auto mb-2 text-purple-500" />
                  <h3 className="text-lg font-medium mb-2">Select a Category</h3>
                  <p className="text-sm text-gray-600">
                    Click on any category above to view the posts within that theme.
                  </p>
                </div>
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
                              className="cursor-pointer"
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