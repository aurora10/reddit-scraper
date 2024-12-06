import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './types'

// Client-side Supabase client (for components)
export const supabase = createClientComponentClient<Database>()
