// 'use client'

// import { useState } from 'react'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import { Badge } from "@/components/ui/badge"
// import type { PostWithAnalysis } from "@/lib/types"

// type SortField = 'score' | 'created_utc' | 'num_comments'
// type SortDirection = 'asc' | 'desc'

// interface PostsTableProps {
//   posts: PostWithAnalysis[]
// }

// function CategoryBadges({ post }: { post: PostWithAnalysis }) {
//   if (!post.analysis) return null;

//   return (
//     <div className="flex gap-2 flex-wrap">
//       {post.analysis.isSolutionRequest && (
//         <Badge className="bg-blue-500">Solution</Badge>
//       )}
//       {post.analysis.isPainOrAnger && (
//         <Badge className="bg-red-500">Pain</Badge>
//       )}
//       {post.analysis.isAdviceRequest && (
//         <Badge className="bg-green-500">Advice</Badge>
//       )}
//       {post.analysis.isMoneyTalk && (
//         <Badge className="bg-yellow-500">Money</Badge>
//       )}
//     </div>
//   )
// }

// export function PostsTable({ posts }: PostsTableProps) {
//   const [sortField, setSortField] = useState<SortField>('score')
//   const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

//   const handleSort = (field: SortField) => {
//     if (field === sortField) {
//       setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
//     } else {
//       setSortField(field)
//       setSortDirection('desc')
//     }
//   }

//   const sortedPosts = [...posts].sort((a, b) => {
//     const multiplier = sortDirection === 'asc' ? 1 : -1
//     return (a[sortField] - b[sortField]) * multiplier
//   })

//   return (
//     <div className="rounded-md border">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Title</TableHead>
//             <TableHead 
//               className="cursor-pointer"
//               onClick={() => handleSort('score')}
//             >
//               Score {sortField === 'score' && (sortDirection === 'asc' ? '↑' : '↓')}
//             </TableHead>
//             <TableHead>Content</TableHead>
//             <TableHead>URL</TableHead>
//             <TableHead 
//               className="cursor-pointer"
//               onClick={() => handleSort('created_utc')}
//             >
//               Creation Time {sortField === 'created_utc' && (sortDirection === 'asc' ? '↑' : '↓')}
//             </TableHead>
//             <TableHead 
//               className="cursor-pointer"
//               onClick={() => handleSort('num_comments')}
//             >
//               Comments {sortField === 'num_comments' && (sortDirection === 'asc' ? '↑' : '↓')}
//             </TableHead>
//             <TableHead>Categories</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {sortedPosts.map((post) => (
//             <TableRow key={post.id}>
//               <TableCell className="max-w-md">
//                 <a 
//                   href={post.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="font-medium hover:text-blue-600 block"
//                 >
//                   {post.title}
//                 </a>
//               </TableCell>
//               <TableCell>{post.score}</TableCell>
//               <TableCell>
//                 <a 
//                   href={post.permalink}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="hover:text-blue-600"
//                 >
//                   View on Reddit
//                 </a>
//               </TableCell>
//               <TableCell>
//                 <a 
//                   href={post.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="hover:text-blue-600 truncate block max-w-xs"
//                 >
//                   {post.url}
//                 </a>
//               </TableCell>
//               <TableCell>
//                 {new Date(post.created_utc * 1000).toLocaleString()}
//               </TableCell>
//               <TableCell>{post.num_comments}</TableCell>
//               <TableCell>
//                 <CategoryBadges post={post} />
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   )
// }

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
import { ChevronUp, ChevronDown } from 'lucide-react'
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
        <Badge className="bg-blue-500 hover:bg-blue-600">Solution</Badge>
      )}
      {post.analysis.isPainOrAnger && (
        <Badge className="bg-red-500 hover:bg-red-600">Pain</Badge>
      )}
      {post.analysis.isAdviceRequest && (
        <Badge className="bg-green-500 hover:bg-green-600">Advice</Badge>
      )}
      {post.analysis.isMoneyTalk && (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">Money</Badge>
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
    <div className="rounded-lg border border-navy-600 overflow-hidden bg-navy-800 bg-opacity-50">
      <Table>
        <TableHeader>
          <TableRow className="bg-navy-700 hover:bg-navy-600">
            <TableHead className="text-blue-300">Title</TableHead>
            <TableHead 
              className="cursor-pointer text-blue-300 hover:text-blue-200"
              onClick={() => handleSort('score')}
            >
              <div className="flex items-center">
                Score
                {sortField === 'score' && (
                  sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                )}
              </div>
            </TableHead>
            <TableHead className="text-blue-300">Content</TableHead>
            <TableHead className="text-blue-300">URL</TableHead>
            <TableHead 
              className="cursor-pointer text-blue-300 hover:text-blue-200"
              onClick={() => handleSort('created_utc')}
            >
              <div className="flex items-center">
                Creation Time
                {sortField === 'created_utc' && (
                  sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                )}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer text-blue-300 hover:text-blue-200"
              onClick={() => handleSort('num_comments')}
            >
              <div className="flex items-center">
                Comments
                {sortField === 'num_comments' && (
                  sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                )}
              </div>
            </TableHead>
            <TableHead className="text-blue-300">Categories</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPosts.map((post) => (
            <TableRow key={post.id} className="hover:bg-navy-700">
              <TableCell className="max-w-md">
                <a 
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-300 hover:text-blue-200 block"
                >
                  {post.title}
                </a>
              </TableCell>
              <TableCell className="text-blue-200">{post.score}</TableCell>
              <TableCell>
                <a 
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200"
                >
                  View on Reddit
                </a>
              </TableCell>
              <TableCell>
                <a 
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 truncate block max-w-xs"
                >
                  {post.url}
                </a>
              </TableCell>
              <TableCell className="text-blue-200">
                {new Date(post.created_utc * 1000).toLocaleString()}
              </TableCell>
              <TableCell className="text-blue-200">{post.num_comments}</TableCell>
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

