'use client'

import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface KeywordCloudProps {
  keywords: Array<{ word: string, count: number }> | undefined
}

export function KeywordCloud({ keywords }: KeywordCloudProps) {
  if (!keywords || keywords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Keywords</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">No keyword data available</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate font sizes based on counts
  const maxCount = Math.max(...keywords.map(k => k.count))
  const minCount = Math.min(...keywords.map(k => k.count))
  const fontSizeScale = (count: number) => {
    // Scale from 14px to 28px based on count
    return 14 + (count - minCount) / (maxCount - minCount) * 14
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Keywords</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-2 p-4">
          {keywords.map(({ word, count }) => (
            <span
              key={word}
              className="inline-block px-2 py-1 rounded"
              style={{
                fontSize: `${fontSizeScale(count)}px`,
                opacity: 0.5 + (count / maxCount) * 0.5,
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 