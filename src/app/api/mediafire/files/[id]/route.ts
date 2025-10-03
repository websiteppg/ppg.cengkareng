import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// PUT - Update file
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const body = await request.json()
    const { id } = params
    
    const { filename, mediafire_url, category, description, file_size, file_type, tags } = body

    // Validate MediaFire URL
    if (mediafire_url && !mediafire_url.includes('mediafire.com')) {
      return NextResponse.json({ error: 'Invalid MediaFire URL' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('mediafire_files')
      .update({
        filename,
        mediafire_url,
        category,
        description,
        file_size,
        file_type,
        tags
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete file (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { id } = params

    const { data, error } = await supabase
      .from('mediafire_files')
      .update({ 
        is_active: false
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'File deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}