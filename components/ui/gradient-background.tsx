'use client'

import React from 'react'

interface GradientBackgroundProps {
  children: React.ReactNode
  className?: string
}

export function GradientBackground({ children, className = '' }: GradientBackgroundProps) {
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(to bottom right, #f0f9ff, #ffffff, #f5f3ff)',
      }}
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
      {children}
    </div>
  )
} 