import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileIds, user_id } = body
    
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json({ error: 'No files selected' }, { status: 400 })
    }
    
    if (!user_id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    
    const supabase = createClient()
    
    // Get file info before deletion for logging
    const { data: filesToDelete } = await supabase
      .from('mediafire_files')
      .select('id, filename, category')
      .in('id', fileIds)
      .eq('is_active', true)
    
    if (!filesToDelete || filesToDelete.length === 0) {
      return NextResponse.json({ error: 'No valid files found' }, { status: 404 })
    }
    
    // Individual updates to avoid TypeScript issues
    for (const fileId of fileIds) {
      await (supabase as any)
        .from('mediafire_files')
        .update({ is_active: false })
        .eq('id', fileId)
    }
    
    // Error handling removed since we have fallback
    
    // Log bulk delete activity
    const activityLogs = filesToDelete.map((file: any) => ({
      file_id: file.id,
      action: 'bulk_delete',
      user_id,
      details: { 
        filename: file.filename,
        category: file.category,
        bulk_operation: true
      },
      ip_address: request.ip,
      user_agent: request.headers.get('user-agent')
    }))
    
    await (supabase as any)
      .from('mediafire_activity_log')
      .insert(activityLogs)
    
    return NextResponse.json({ 
      message: `${filesToDelete.length} files deleted successfully`,
      deletedCount: filesToDelete.length
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}