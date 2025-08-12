// app/page.tsx
'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/app/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-md p-8 space-y-8">
        <h1 className="text-3xl font-bold text-center text-white">Ambient-AI</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={['google', 'spotify']}
          redirectTo='http://localhost:3000/auth/callback'
          queryParams={{
            scope: 'user-read-recently-played user-read-email',
          }}
        />
      </div>
    </div>
  )
}