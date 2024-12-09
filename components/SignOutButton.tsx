// 'use client'

// import { useState } from 'react'
// import { Button } from './ui/button'
// import { supabase } from '../lib/supabase-client'
// import { useRouter } from 'next/navigation'

// export function SignOutButton() {
//   const [isLoading, setIsLoading] = useState(false)
//   const router = useRouter()

//   const handleSignOut = async () => {
//     try {
//       setIsLoading(true)
//       const { error } = await supabase.auth.signOut()
      
//       if (error) {
//         console.error('Error signing out:', error)
//         throw error
//       }

//       // Clear any cached data
//       router.refresh()
      
//       // Force reload to clear all state
//       window.location.href = '/'
//     } catch (error) {
//       console.error('Error:', error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <Button 
//       variant="outline" 
//       onClick={handleSignOut}
//       disabled={isLoading}
//     >
//       {isLoading ? 'Signing out...' : 'Sign out'}
//     </Button>
//   )
// }

'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { supabase } from '../lib/supabase-client'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error signing out:', error)
        throw error
      }

      // Clear any cached data
      router.refresh()
      
      // Force reload to clear all state
      window.location.href = '/'
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleSignOut}
      disabled={isLoading}
      className="bg-blue-500 hover:bg-blue-600 text-white border-none"
    >
      {isLoading ? 'Signing out...' : 'Sign out'}
    </Button>
  )
}
