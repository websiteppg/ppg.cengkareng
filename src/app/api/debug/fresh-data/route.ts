import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Create completely fresh Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const timestamp = Date.now()
    console.log(`[FRESH ${timestamp}] Creating new Supabase connection...`)

    // Get fresh data with service role key
    const { data: programKerja, error } = await supabase
      .from('program_kerja')
      .select('*')
      .order('created_at', { ascending: false })

    console.log(`[FRESH ${timestamp}] Found ${programKerja?.length} records`)

    return NextResponse.json({
      timestamp,
      count: programKerja?.length || 0,
      data: programKerja,
      error
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}