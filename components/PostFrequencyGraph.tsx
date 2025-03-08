'use client'

import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface PostFrequencyGraphProps {
  frequency: {
    byHour: number[]
    mostActiveHour: number
  } | undefined
}

export function PostFrequencyGraph({ frequency }: PostFrequencyGraphProps) {
  if (!frequency) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Posting Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">No activity data available</p>
        </CardContent>
      </Card>
    )
  }

  const { byHour, mostActiveHour } = frequency
  const maxCount = Math.max(...byHour)

  // Format hour for display (e.g., "3 PM", "12 AM")
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM'
    if (hour === 12) return '12 PM'
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Posting Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">Most Active Time</p>
          <p className="text-2xl font-bold">{formatHour(mostActiveHour)}</p>
        </div>
        
        <div className="h-40 flex items-end space-x-1">
          {byHour.map((count, hour) => (
            <div 
              key={hour} 
              className="flex-1 flex flex-col items-center"
            >
              <div 
                className={`w-full ${hour === mostActiveHour ? 'bg-blue-500' : 'bg-blue-300'} rounded-t`}
                style={{ 
                  height: `${(count / maxCount) * 100}%`,
                  minHeight: count > 0 ? '4px' : '0'
                }}
              ></div>
              {hour % 6 === 0 && (
                <div className="text-xs text-gray-500 mt-1">{formatHour(hour)}</div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 