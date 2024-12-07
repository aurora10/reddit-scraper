import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './types'

// Create a single instance of the Supabase client for client components
export const supabase = createClientComponentClient<Database>()
