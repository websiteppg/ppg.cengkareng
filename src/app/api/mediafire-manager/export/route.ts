import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''
    
    const supabase = createClient()
    
    let query = supabase
      .from('mediafire_files')
      .select(`
        filename,
        mediafire_url,
        category,
        description,
        file_size,
        file_type,
        upload_date,
        tags,
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
    
    query = query.order('upload_date', { ascending: false })
    
    const { data: files, error } = await query
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
    }
    
    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Filename',
        'MediaFire URL',
        'Category',
        'Description',
        'File Size',
        'File Type',
        'Upload Date',
        'Tags',
        'Created By',
        'Creator Email'
      ]
      
      const csvRows = [
        headers.join(','),
        ...files.map((file: any) => [
          `"${file.filename}"`,
          `"${file.mediafire_url}"`,
          `"${file.category}"`,
          `"${file.description || ''}"`,
          `"${file.file_size || ''}"`,
          `"${file.file_type || ''}"`,
          `"${new Date(file.upload_date).toLocaleDateString()}"`,
          `"${file.tags ? JSON.stringify(file.tags) : ''}"`,
          `"${file.peserta?.nama || ''}"`,
          `"${file.peserta?.email || ''}"`
        ].join(','))
      ]
      
      const csvContent = csvRows.join('\n')
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="mediafire-files-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }
    
    // Return JSON for other formats
    return NextResponse.json(files)
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}