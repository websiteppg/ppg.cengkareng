import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Test basic connection
    const { data, error } = await supabase
      .from('peserta')
      .select('id, nama, role')
      .limit(1)
    
    if (error) {
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({
      status: 'OK',
      database_connected: true,
      message: 'MediaFire Manager API is working',
      sample_user: data?.[0] || null
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'API test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}