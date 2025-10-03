import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET - Fetch all files with pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    const offset = (page - 1) * limit

    let query = supabase
      .from('mediafire_files')
      .select(`
        *,
        peserta:created_by(nama, email)
      `)
      .eq('is_active', true)

    if (search) {
      query = query.ilike('filename', `%${search}%`)
    }

    if (category) {
      query = query.eq('category', category)
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    const { data: files, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add new file
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const body = await request.json()
    
    const { filename, mediafire_url, category, description, file_size, file_type, tags, created_by } = body

    // Validate MediaFire URL
    if (!mediafire_url.includes('mediafire.com')) {
      return NextResponse.json({ error: 'Invalid MediaFire URL' }, { status: 400 })
    }

    // Check for duplicate URL
    const { data: existing } = await supabase
      .from('mediafire_files')
      .select('id')
      .eq('mediafire_url', mediafire_url)
      .eq('is_active', true)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'File with this URL already exists' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('mediafire_files')
      .insert({
        filename,
        mediafire_url,
        category: category || 'others',
        description,
        file_size,
        file_type,
        tags,
        created_by
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}