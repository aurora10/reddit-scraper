'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SubredditTabsProps {
  postsContent: React.ReactNode
  themesContent: React.ReactNode
}

export function SubredditTabs({ postsContent, themesContent }: SubredditTabsProps) {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="posts" className="flex-1">Top Posts</TabsTrigger>
        <TabsTrigger value="themes" className="flex-1">Themes</TabsTrigger>
      </TabsList>
      <TabsContent value="posts" className="mt-6">
        {postsContent}
      </TabsContent>
      <TabsContent value="themes" className="mt-6">
        {themesContent}
      </TabsContent>
    </Tabs>
  )
}
