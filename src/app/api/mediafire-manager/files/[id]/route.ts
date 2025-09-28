import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { filename, mediafire_url, category, description, file_size, file_type, tags, user_id } = body
    
    if (!filename || !mediafire_url || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    if (!mediafire_url.includes('mediafire.com')) {
      return NextResponse.json({ error: 'Invalid MediaFire URL format' }, { status: 400 })
    }
    
    const supabase = createClient()
    
    // Check if file exists and get current data
    const { data: currentFile, error: fetchError } = await supabase
      .from('mediafire_files')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()
    
    if (fetchError || !currentFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    
    // Check for duplicate URL (excluding current file)
    const { data: existing } = await supabase
      .from('mediafire_files')
      .select('id')
      .eq('mediafire_url', mediafire_url)
      .neq('id', id)
      .eq('is_active', true)
      .single()
    
    if (existing) {
      return NextResponse.json({ error: 'Another file with this MediaFire URL already exists' }, { status: 409 })
    }
    
    // Update file
    const { data: updatedFile, error } = await (supabase as any)
      .from('mediafire_files')
      .update({
        filename,
        mediafire_url,
        category: category || 'Others',
        description,
        file_size,
        file_type,
        tags: tags ? JSON.parse(tags) : null
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update file' }, { status: 500 })
    }
    
    // Log activity
    await (supabase as any)
      .from('mediafire_activity_log')
      .insert({
        file_id: id,
        action: 'update',
        user_id,
        details: { 
          old_filename: (currentFile as any).filename,
          new_filename: filename,
          category 
        },
        ip_address: request.ip,
        user_agent: request.headers.get('user-agent')
      })
    
    return NextResponse.json(updatedFile)
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    
    if (!user_id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    
    const supabase = createClient()
    
    // Get file info before deletion
    const { data: fileInfo } = await supabase
      .from('mediafire_files')
      .select('filename, category')
      .eq('id', id)
      .eq('is_active', true)
      .single()
    
    if (!fileInfo) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    
    // Soft delete
    const { error } = await (supabase as any)
      .from('mediafire_files')
      .update({ 
        is_active: false
      })
      .eq('id', id)
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
    }
    
    // Log activity
    await (supabase as any)
      .from('mediafire_activity_log')
      .insert({
        file_id: id,
        action: 'delete',
        user_id,
        details: { 
          filename: (fileInfo as any).filename,
          category: (fileInfo as any).category 
        },
        ip_address: request.ip,
        user_agent: request.headers.get('user-agent')
      })
    
    return NextResponse.json({ message: 'File deleted successfully' })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}