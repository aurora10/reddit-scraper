import { SubredditAnalytics } from '../../../components/SubredditAnalytics'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function SubredditPage({ params }: { params: { name: string } }) {
  const supabase = createServerComponentClient({ cookies })
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/')
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <SubredditAnalytics subredditName={params.name} />
    </div>
  )
}

