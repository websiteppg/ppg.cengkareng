import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const id = params.id

    const { data, error } = await supabase
      .from('peserta')
      .select('id, nama, email')
      .eq('id', id)
      .single()

    return NextResponse.json({ data, error })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}