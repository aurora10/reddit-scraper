// 'use client'

// import { useState } from "react"
// import { Button } from "./ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "./ui/dialog"
// import { Input } from "./ui/input"
// import { createSubreddit } from "../lib/db"
// import type { Subreddit } from "../lib/db"

// interface AddSubredditModalProps {
//   onAdd: (subreddit: Subreddit) => void
// }

// export function AddSubredditModal({ onAdd }: AddSubredditModalProps) {
//   const [url, setUrl] = useState("")
//   const [open, setOpen] = useState(false)
//   const [error, setError] = useState("")
//   const [isLoading, setIsLoading] = useState(false)

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError("")
//     setIsLoading(true)

//     try {
//       // Extract subreddit name from URL, supporting both www and non-www URLs
//       const urlPattern = /(?:www\.)?reddit\.com\/r\/([^/?]+)/
//       const match = url.match(urlPattern)
      
//       if (!match) {
//         setError("Please enter a valid subreddit URL (e.g., https://reddit.com/r/nextjs or https://www.reddit.com/r/nextjs)")
//         setIsLoading(false)
//         return
//       }

//       const subredditName = match[1].toLowerCase() // Ensure lowercase for consistency
      
//       console.log('Attempting to create subreddit:', {
//         name: subredditName,
//         display_name: subredditName
//       })

//       // Create subreddit in database
//       const subreddit = await createSubreddit(subredditName, subredditName)
      
//       console.log('Subreddit created successfully:', subreddit)
      
//       onAdd(subreddit)
//       setUrl("")
//       setOpen(false)
//     } catch (error) {
//       console.error('Error in handleSubmit:', error instanceof Error ? {
//         message: error.message,
//         stack: error.stack
//       } : error)
      
//       // Handle specific errors
//       if (error instanceof Error) {
//         if (error.message.includes('No authenticated user') || error.message.includes('Authentication error')) {
//           setError("Please sign in again to add subreddits")
//         } else if (error.message.includes('duplicate key')) {
//           setError("This subreddit has already been added")
//         } else if (error.message.includes('permission denied')) {
//           setError("Permission denied - please check your access rights")
//         } else if (error.message.includes('Database error')) {
//           setError(error.message)
//         } else if (error.message.includes('Error creating user')) {
//           setError("Failed to create user profile - please try signing out and back in")
//         } else {
//           // Include the actual error message for better debugging
//           setError(`Error adding subreddit: ${error.message}`)
//         }
//       } else {
//         // Log the raw error object for debugging
//         console.error('Non-Error object thrown:', JSON.stringify(error, null, 2))
//         setError("An unexpected error occurred. Please try signing out and back in.")
//       }
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button variant="outline">Add Subreddit</Button>
//       </DialogTrigger>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Add New Subreddit</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <Input
//               placeholder="Enter subreddit URL (e.g., https://reddit.com/r/nextjs)"
//               value={url}
//               onChange={(e) => setUrl(e.target.value)}
//               disabled={isLoading}
//             />
//             {error && (
//               <p className="text-sm text-red-500 mt-1">
//                 {error}
//                 {error.includes('sign') && (
//                   <Button
//                     variant="link"
//                     className="text-red-500 underline ml-1 p-0 h-auto"
//                     onClick={() => window.location.reload()}
//                   >
//                     Refresh page
//                   </Button>
//                 )}
//               </p>
//             )}
//           </div>
//           <Button type="submit" disabled={isLoading}>
//             {isLoading ? "Adding..." : "Add"}
//           </Button>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }

'use client'

import { useState } from "react"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { createSubreddit } from "../lib/db"
import type { Subreddit } from "../lib/db"

interface AddSubredditModalProps {
  onAdd: (subreddit: Subreddit) => void
}

export function AddSubredditModal({ onAdd }: AddSubredditModalProps) {
  const [url, setUrl] = useState("")
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Extract subreddit name from URL, supporting both www and non-www URLs
      const urlPattern = /(?:www\.)?reddit\.com\/r\/([^/?]+)/
      const match = url.match(urlPattern)
      
      if (!match) {
        setError("Please enter a valid subreddit URL (e.g., https://reddit.com/r/nextjs or https://www.reddit.com/r/nextjs)")
        setIsLoading(false)
        return
      }

      const subredditName = match[1].toLowerCase() // Ensure lowercase for consistency
      
      console.log('Attempting to create subreddit:', {
        name: subredditName,
        display_name: subredditName
      })

      // Create subreddit in database
      const subreddit = await createSubreddit(subredditName, subredditName)
      
      console.log('Subreddit created successfully:', subreddit)
      
      onAdd(subreddit)
      setUrl("")
      setOpen(false)
    } catch (error) {
      console.error('Error in handleSubmit:', error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error)
      
      // Handle specific errors
      if (error instanceof Error) {
        if (error.message.includes('No authenticated user') || error.message.includes('Authentication error')) {
          setError("Please sign in again to add subreddits")
        } else if (error.message.includes('duplicate key')) {
          setError("This subreddit has already been added")
        } else if (error.message.includes('permission denied')) {
          setError("Permission denied - please check your access rights")
        } else if (error.message.includes('Database error')) {
          setError(error.message)
        } else if (error.message.includes('Error creating user')) {
          setError("Failed to create user profile - please try signing out and back in")
        } else {
          // Include the actual error message for better debugging
          setError(`Error adding subreddit: ${error.message}`)
        }
      } else {
        // Log the raw error object for debugging
        console.error('Non-Error object thrown:', JSON.stringify(error, null, 2))
        setError("An unexpected error occurred. Please try signing out and back in.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-blue-500 hover:bg-blue-600 text-white border-none"
        >
          Add Subreddit
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-br from-navy-800 to-navy-900 text-white border border-blue-500">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">Add New Subreddit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              placeholder="Enter subreddit URL (e.g., https://reddit.com/r/nextjs)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="bg-navy-700 border-blue-500 text-white placeholder-blue-300"
            />
            {error && (
              <p className="text-sm text-red-400 mt-2">
                {error}
                {error.includes('sign') && (
                  <Button
                    variant="link"
                    className="text-blue-300 underline ml-1 p-0 h-auto"
                    onClick={() => window.location.reload()}
                  >
                    Refresh page
                  </Button>
                )}
              </p>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isLoading ? "Adding..." : "Add"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

