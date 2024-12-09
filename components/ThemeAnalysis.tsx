// 'use client'

// import { useState } from 'react'
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { PostsTable } from "@/components/PostsTable"
// import type { PostWithAnalysis } from "@/lib/types"

// interface ThemeAnalysisProps {
//   posts: PostWithAnalysis[]
// }

// interface ThemeCardProps {
//   title: string
//   description: string
//   posts: PostWithAnalysis[]
//   filterFn: (post: PostWithAnalysis) => boolean
//   isSelected: boolean
//   onClick: () => void
// }

// function ThemeCard({ title, description, posts, filterFn, isSelected, onClick }: ThemeCardProps) {
//   const matchingPosts = posts.filter(filterFn)
  
//   return (
//     <Card 
//       className={`cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'border-blue-500 border-2' : ''}`}
//       onClick={onClick}
//     >
//       <CardHeader>
//         <CardTitle>{title}</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <p className="text-gray-600 mb-2">{description}</p>
//         <p className="text-sm font-medium">
//           {matchingPosts.length} posts in this category
//         </p>
//       </CardContent>
//     </Card>
//   )
// }

// export function ThemeAnalysis({ posts }: ThemeAnalysisProps) {
//   const [selectedTheme, setSelectedTheme] = useState<string | null>(null)

//   const themes = [
//     {
//       id: 'solution',
//       title: 'Solution Requests',
//       description: 'Posts seeking solutions to problems',
//       filterFn: (post: PostWithAnalysis) => post.analysis?.isSolutionRequest ?? false
//     },
//     {
//       id: 'pain',
//       title: 'Pain & Anger',
//       description: 'Posts expressing frustration or anger',
//       filterFn: (post: PostWithAnalysis) => post.analysis?.isPainOrAnger ?? false
//     },
//     {
//       id: 'advice',
//       title: 'Advice Requests',
//       description: 'Posts seeking advice',
//       filterFn: (post: PostWithAnalysis) => post.analysis?.isAdviceRequest ?? false
//     },
//     {
//       id: 'money',
//       title: 'Money Talk',
//       description: 'Posts discussing financial aspects',
//       filterFn: (post: PostWithAnalysis) => post.analysis?.isMoneyTalk ?? false
//     }
//   ]

//   const selectedThemeData = themes.find(theme => theme.id === selectedTheme)
//   const filteredPosts = selectedThemeData 
//     ? posts.filter(selectedThemeData.filterFn)
//     : []

//   return (
//     <div className="space-y-8">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {themes.map(theme => (
//           <ThemeCard
//             key={theme.id}
//             title={theme.title}
//             description={theme.description}
//             posts={posts}
//             filterFn={theme.filterFn}
//             isSelected={selectedTheme === theme.id}
//             onClick={() => setSelectedTheme(selectedTheme === theme.id ? null : theme.id)}
//           />
//         ))}
//       </div>

//       {selectedTheme && selectedThemeData && filteredPosts.length > 0 && (
//         <div className="space-y-4">
//           <h2 className="text-xl font-semibold">{selectedThemeData.title} Posts</h2>
//           <PostsTable posts={filteredPosts} />
//         </div>
//       )}
//     </div>
//   )
// }

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostsTable } from "@/components/PostsTable"
import type { PostWithAnalysis } from "@/lib/types"

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

function ThemeCard({ title, description, posts, filterFn, isSelected, onClick }: ThemeCardProps) {
  const matchingPosts = posts.filter(filterFn)
  
  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 bg-navy-800 hover:bg-navy-700 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-blue-300">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-blue-200 mb-2">{description}</p>
        <p className="text-sm font-medium text-blue-300">
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
      filterFn: (post: PostWithAnalysis) => post.analysis?.isSolutionRequest ?? false
    },
    {
      id: 'pain',
      title: 'Pain & Anger',
      description: 'Posts expressing frustration or anger',
      filterFn: (post: PostWithAnalysis) => post.analysis?.isPainOrAnger ?? false
    },
    {
      id: 'advice',
      title: 'Advice Requests',
      description: 'Posts seeking advice',
      filterFn: (post: PostWithAnalysis) => post.analysis?.isAdviceRequest ?? false
    },
    {
      id: 'money',
      title: 'Money Talk',
      description: 'Posts discussing financial aspects',
      filterFn: (post: PostWithAnalysis) => post.analysis?.isMoneyTalk ?? false
    }
  ]

  const selectedThemeData = themes.find(theme => theme.id === selectedTheme)
  const filteredPosts = selectedThemeData 
    ? posts.filter(selectedThemeData.filterFn)
    : []

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-blue-300 bg-navy-800 p-4 rounded-lg">
            {selectedThemeData.title} Posts
          </h2>
          <PostsTable posts={filteredPosts} />
        </div>
      )}
    </div>
  )
}

