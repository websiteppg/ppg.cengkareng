import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { sesi_id: string } }
) {
  try {
    const supabase = createServerClient()
    const sesi_id = params.sesi_id

    const { data, error } = await supabase
      .from('attendance_audit')
      .select(`
        *,
        admin:admin_id (nama, email),
        peserta:peserta_id (nama, email)
      `)
      .eq('sesi_id', sesi_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ audit_logs: data || [] })

  } catch (error) {
    console.error('Audit fetch error:', error)
    return NextResponse.json({ error: 'Gagal mengambil audit log' }, { status: 500 })
  }
}