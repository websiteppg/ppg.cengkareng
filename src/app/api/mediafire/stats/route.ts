import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET - Dashboard statistics
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Total files count
    const { count: totalFiles } = await supabase
      .from('mediafire_files')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Categories breakdown
    const { data: categories } = await supabase
      .from('mediafire_files')
      .select('category')
      .eq('is_active', true)

    const categoryStats = categories?.reduce((acc: any, file) => {
      acc[file.category] = (acc[file.category] || 0) + 1
      return acc
    }, {}) || {}

    // Recent files (last 10)
    const { data: recentFiles } = await supabase
      .from('mediafire_files')
      .select(`
        id,
        filename,
        category,
        file_size,
        created_at,
        peserta:created_by(nama)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      totalFiles: totalFiles || 0,
      categoryStats,
      recentFiles: recentFiles || []
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}