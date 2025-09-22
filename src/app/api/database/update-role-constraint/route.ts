import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    return NextResponse.json({
      message: 'Update database constraint manually in Supabase',
      sql: `ALTER TABLE peserta DROP CONSTRAINT IF EXISTS peserta_role_check;
ALTER TABLE peserta ADD CONSTRAINT peserta_role_check 
CHECK (role IN ('peserta', 'sekretaris_ppg', 'admin_kmm', 'admin', 'super_admin'));`
    })

  } catch (error) {
    console.error('Update constraint error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}