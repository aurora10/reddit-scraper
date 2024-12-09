// 'use client'

// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// interface SubredditTabsProps {
//   postsContent: React.ReactNode
//   themesContent: React.ReactNode
// }

// export function SubredditTabs({ postsContent, themesContent }: SubredditTabsProps) {
//   return (
//     <Tabs defaultValue="posts" className="w-full">
//       <TabsList className="w-full">
//         <TabsTrigger value="posts" className="flex-1">Top Posts</TabsTrigger>
//         <TabsTrigger value="themes" className="flex-1">Themes</TabsTrigger>
//       </TabsList>
//       <TabsContent value="posts" className="mt-6">
//         {postsContent}
//       </TabsContent>
//       <TabsContent value="themes" className="mt-6">
//         {themesContent}
//       </TabsContent>
//     </Tabs>
//   )
// }


'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SubredditTabsProps {
  postsContent: React.ReactNode
  themesContent: React.ReactNode
}

export function SubredditTabs({ postsContent, themesContent }: SubredditTabsProps) {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full mb-6 bg-navy-800 p-1 rounded-lg">
        <TabsTrigger 
          value="posts" 
          className="flex-1 py-3 text-sm font-medium transition-all data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md"
        >
          Top Posts
        </TabsTrigger>
        <TabsTrigger 
          value="themes" 
          className="flex-1 py-3 text-sm font-medium transition-all data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md"
        >
          Themes
        </TabsTrigger>
      </TabsList>
      <TabsContent value="posts" className="mt-6 bg-navy-800 bg-opacity-50 rounded-lg p-6">
        {postsContent}
      </TabsContent>
      <TabsContent value="themes" className="mt-6 bg-navy-800 bg-opacity-50 rounded-lg p-6">
        {themesContent}
      </TabsContent>
    </Tabs>
  )
}

