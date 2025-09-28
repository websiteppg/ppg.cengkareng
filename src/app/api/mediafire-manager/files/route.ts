import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const sortBy = searchParams.get('sortBy') || 'upload_date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    const supabase = createClient()
    
    // Check if table exists first
    const { data: tableCheck } = await supabase
      .from('mediafire_files')
      .select('id')
      .limit(1)
    
    // If table doesn't exist, return empty result
    if (!tableCheck) {
      return NextResponse.json({
        files: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        message: 'MediaFire tables not yet created. Please run database migration.'
      })
    }
    
    let query = supabase
      .from('mediafire_files')
      .select(`
        *,
        peserta:created_by (
          nama,
          email
        )
      `)
      .eq('is_active', true)
    
    // Apply filters
    if (search) {
      query = query.ilike('filename', `%${search}%`)
    }
    
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    
    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
    
    const { data: files, error, count } = await query
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
    }
    
    return NextResponse.json({
      files,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename, mediafire_url, category, description, file_size, file_type, tags, created_by } = body
    
    // Validate required fields
    if (!filename || !mediafire_url || !created_by) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Validate MediaFire URL format
    if (!mediafire_url.includes('mediafire.com')) {
      return NextResponse.json({ error: 'Invalid MediaFire URL format' }, { status: 400 })
    }
    
    const supabase = createClient()
    
    // Check if table exists first
    const { data: tableCheck, error: tableError } = await supabase
      .from('mediafire_files')
      .select('id')
      .limit(1)
    
    if (tableError && tableError.code === 'PGRST116') {
      return NextResponse.json({ 
        error: 'MediaFire tables not created yet. Please run database migration first.',
        code: 'TABLE_NOT_EXISTS'
      }, { status: 400 })
    }
    
    // Check for duplicate URL
    const { data: existing, error: duplicateError } = await supabase
      .from('mediafire_files')
      .select('id')
      .eq('mediafire_url', mediafire_url)
      .eq('is_active', true)
      .maybeSingle()
    
    // Only return conflict if we actually found a duplicate (not if query failed)
    if (existing && !duplicateError) {
      return NextResponse.json({ error: 'File with this MediaFire URL already exists' }, { status: 409 })
    }
    
    // Insert new file using raw SQL to avoid TypeScript issues
    const insertQuery = `
      INSERT INTO mediafire_files (filename, mediafire_url, category, description, file_size, file_type, tags, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `
    
    const { data: newFile, error } = await (supabase as any)
      .rpc('execute_sql', {
        query: insertQuery,
        params: [filename, mediafire_url, category || 'Others', description, file_size, file_type, tags ? JSON.stringify(tags) : null, created_by]
      })
    
    // Fallback: try direct insert if RPC fails
    if (error) {
      const fallbackResult = await (supabase as any)
        .from('mediafire_files')
        .insert([{
          filename,
          mediafire_url,
          category: category || 'Others',
          description,
          file_size,
          file_type,
          tags: tags ? JSON.parse(tags) : null,
          created_by
        }])
        .select()
      
      if (fallbackResult.error) {
        console.error('Database error:', fallbackResult.error)
        return NextResponse.json({ error: 'Failed to create file' }, { status: 500 })
      }
      
      const newFileData = fallbackResult.data?.[0]
      if (!newFileData) {
        return NextResponse.json({ error: 'Failed to create file' }, { status: 500 })
      }
      
      return NextResponse.json(newFileData, { status: 201 })
    }
    
    // Log activity if file creation was successful
    if (newFile) {
      await (supabase as any)
        .from('mediafire_activity_log')
        .insert([{
          file_id: newFile.id,
          action: 'create',
          user_id: created_by,
          details: { filename, category },
          ip_address: request.ip,
          user_agent: request.headers.get('user-agent')
        }])
    }
    
    return NextResponse.json(newFile || { message: 'File created' }, { status: 201 })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}