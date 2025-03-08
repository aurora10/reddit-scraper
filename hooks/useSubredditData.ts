'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  fetchSubredditFromDatabase, 
  analyzeAndStoreSubredditData 
} from '../lib/subreddit-service'
import { useState, useEffect } from 'react'
import { SubredditAnalytics } from '../lib/types'

export function useSubredditData(subredditName: string) {
  const queryClient = useQueryClient()
  const [isRefreshNeeded, setIsRefreshNeeded] = useState(false)
  
  // Phase 1: Initial data load from database - Updated for React Query v5
  const { 
    data: existingData,
    isLoading: isLoadingInitial,
    error: initialError,
    isError: isInitialError,
    dataUpdatedAt
  } = useQuery({
    queryKey: ['subreddit', subredditName.toLowerCase()],
    queryFn: () => fetchSubredditFromDatabase(subredditName),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  })
  
  // Check if data is stale (older than 30 minutes)
  useEffect(() => {
    if (existingData) {
      const lastUpdated = new Date(existingData.last_updated).getTime()
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000
      
      if (lastUpdated < thirtyMinutesAgo) {
        setIsRefreshNeeded(true)
      }
    }
  }, [existingData, dataUpdatedAt])
  
  // Phase 2: Background refresh mutation - Updated for React Query v5
  const { 
    mutate: refreshData,
    isPending: isRefreshing,
    error: refreshError,
    isError: isRefreshError,
    reset: resetRefresh
  } = useMutation({
    mutationFn: () => analyzeAndStoreSubredditData(subredditName),
    onSuccess: (newData) => {
      // Update the cache with new data
      queryClient.setQueryData(['subreddit', subredditName.toLowerCase()], newData)
      setIsRefreshNeeded(false)
    }
  })
  
  // Auto-refresh if needed and not already refreshing
  useEffect(() => {
    if (existingData && isRefreshNeeded && !isRefreshing) {
      refreshData()
    }
  }, [existingData, isRefreshNeeded, isRefreshing, refreshData])
  
  // Combine errors for easier handling
  const error = initialError || refreshError
  const isError = isInitialError || isRefreshError
  
  return {
    data: existingData,
    isLoadingInitial,
    isRefreshing,
    refreshData,
    isRefreshNeeded,
    error,
    isError,
    resetRefresh
  }
} 