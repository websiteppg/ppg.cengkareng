import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get current session
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      // Log activity before logout (optional)
      try {
        await (supabase as any)
          .from('log_aktivitas')
          .insert({
            peserta_id: session.user.id,
            aktivitas: 'logout',
            detail: { ip: request.ip },
            ip_address: request.ip,
            user_agent: request.headers.get('user-agent')
          })
      } catch (logError) {
        console.log('Log activity failed:', logError)
      }

      // Sign out
      await supabase.auth.signOut()
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}