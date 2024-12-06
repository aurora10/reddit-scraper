'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { supabase } from '../lib/supabase'

export function SignInButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('Error signing in:', error)
        throw error
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleSignIn}
      disabled={isLoading}
    >
      {isLoading ? 'Signing in...' : 'Sign in with Google'}
    </Button>
  )
}
