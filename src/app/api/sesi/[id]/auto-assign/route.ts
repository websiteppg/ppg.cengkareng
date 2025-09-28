import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const sesiId = params.id
    const body = await request.json()
    const { criteria } = body

    // Get all active peserta based on criteria
    let query = supabase
      .from('peserta')
      .select('id')
      .eq('aktif', true)

    if (criteria?.role) {
      query = query.eq('role', criteria.role)
    }

    const { data: peserta, error: pesertaError } = await query

    if (pesertaError) {
      return NextResponse.json({ error: pesertaError.message }, { status: 500 })
    }

    if (!peserta || peserta.length === 0) {
      return NextResponse.json({ error: 'Tidak ada peserta yang sesuai kriteria' }, { status: 400 })
    }

    // Delete existing assignments
    await (supabase as any)
      .from('sesi_peserta')
      .delete()
      .eq('sesi_id', sesiId)

    // Insert new assignments
    const assignments = peserta.map((p: any) => ({
      sesi_id: sesiId,
      peserta_id: p.id,
      created_at: new Date().toISOString()
    }))

    const { error: insertError } = await (supabase as any)
      .from('sesi_peserta')
      .insert(assignments)

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Auto assign berhasil',
      count: assignments.length 
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}