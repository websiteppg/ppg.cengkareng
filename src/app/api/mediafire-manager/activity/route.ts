import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action') || ''
    
    const supabase = createClient()
    
    // Check if tables exist
    const { data: tableCheck } = await supabase
      .from('mediafire_activity_log')
      .select('id')
      .limit(1)
    
    if (!tableCheck) {
      return NextResponse.json({
        activities: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
        message: 'Activity log table not created yet'
      })
    }
    
    let query = supabase
      .from('mediafire_activity_log')
      .select(`
        *,
        peserta:user_id (
          nama,
          email
        ),
        mediafire_files:file_id (
          filename
        )
      `)
    
    // Apply filters
    if (action && action !== 'all') {
      query = query.eq('action', action)
    }
    
    // Apply sorting and pagination
    query = query.order('created_at', { ascending: false })
    
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
    
    const { data: activities, error, count } = await query
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
    }
    
    return NextResponse.json({
      activities: activities || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}