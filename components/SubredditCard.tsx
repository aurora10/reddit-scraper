'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Link from "next/link"
import type { Subreddit } from "@/lib/db"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface SubredditCardProps {
  subreddit: Subreddit
  onDelete?: () => void
}

export function SubredditCard({ subreddit, onDelete }: SubredditCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/subreddit/${subreddit.name}?id=${subreddit.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete subreddit')
      }

      if (onDelete) {
        onDelete()
      } else {
        // Fallback if onDelete isn't provided
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting subreddit:', error)
      alert('Failed to delete subreddit. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // Format the last fetched time
  const lastFetchedText = subreddit.last_fetched_at 
    ? new Date(subreddit.last_fetched_at).toLocaleString()
    : 'Never'

  return (
    <>
      <Link href={`/subreddit/${subreddit.name}`}>
        <Card className="bg-navy-700 text-white hover:bg-gradient-to-br from-navy-800 to-navy-900 cursor-pointer transition-colors border border-blue-500">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
              r/{subreddit.display_name}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowDeleteDialog(true)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-gray-300">
            Last updated: {lastFetchedText}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">
            Added: {new Date(subreddit.created_at).toLocaleDateString()}
          </div>
        </CardContent>
        </Card>
      </Link>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-navy-800 border-blue-500 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Subreddit?</DialogTitle>
            <DialogDescription className="text-gray-300">
              This will permanently delete the subreddit and all its associated data including posts and analytics.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              className="text-white border-blue-500 hover:bg-blue-500/10 hover:text-blue-300"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
