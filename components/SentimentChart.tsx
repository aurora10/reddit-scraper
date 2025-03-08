'use client'

import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface SentimentChartProps {
  sentiment: {
    average: number
    distribution: {
      positive: number
      neutral: number
      negative: number
    }
  } | undefined
}

export function SentimentChart({ sentiment }: SentimentChartProps) {
  if (!sentiment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">No sentiment data available</p>
        </CardContent>
      </Card>
    )
  }

  const { average, distribution } = sentiment
  const sentimentText = average > 0.2 
    ? 'Positive' 
    : average < -0.2 
      ? 'Negative' 
      : 'Neutral'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">Overall Sentiment</p>
          <p className="text-2xl font-bold">{sentimentText}</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div 
              className={`h-2.5 rounded-full ${
                average > 0 ? 'bg-green-500' : average < 0 ? 'bg-red-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${Math.abs(average * 100)}%`, marginLeft: average < 0 ? 0 : '50%' }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-6">
          <div className="text-center">
            <div className="text-green-500 font-bold">{distribution.positive}%</div>
            <div className="text-xs text-gray-500">Positive</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-500 font-bold">{distribution.neutral}%</div>
            <div className="text-xs text-gray-500">Neutral</div>
          </div>
          <div className="text-center">
            <div className="text-red-500 font-bold">{distribution.negative}%</div>
            <div className="text-xs text-gray-500">Negative</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 