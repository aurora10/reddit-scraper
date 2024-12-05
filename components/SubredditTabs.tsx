"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

interface SubredditTabsProps {
  postsContent: ReactNode;
  themesContent: ReactNode;
}

export function SubredditTabs({ postsContent, themesContent }: SubredditTabsProps) {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="posts">Top Posts</TabsTrigger>
        <TabsTrigger value="themes">Themes</TabsTrigger>
      </TabsList>
      
      <TabsContent value="posts" className="space-y-4">
        {postsContent}
      </TabsContent>
      
      <TabsContent value="themes" className="space-y-4">
        {themesContent}
      </TabsContent>
    </Tabs>
  );
}
