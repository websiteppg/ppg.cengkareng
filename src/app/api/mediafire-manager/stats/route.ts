import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check if tables exist
    const { data: tableCheck } = await supabase
      .from('mediafire_files')
      .select('id')
      .limit(1)
    
    if (!tableCheck) {
      return NextResponse.json({
        totalFiles: 0,
        totalSizeEstimate: 'N/A',
        categoryBreakdown: {},
        recentFiles: [],
        activityStats: {},
        message: 'MediaFire tables not created yet'
      })
    }
    
    // Get total files count
    const { count: totalFiles } = await supabase
      .from('mediafire_files')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    // Get category breakdown
    const { data: categoryStats } = await supabase
      .from('mediafire_files')
      .select('category')
      .eq('is_active', true)
    
    const categoryBreakdown = categoryStats?.reduce((acc: any, file) => {
      const category = (file as any).category || 'Others'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {}) || {}
    
    // Get recent files (last 10)
    const { data: recentFiles } = await supabase
      .from('mediafire_files')
      .select(`
        id,
        filename,
        category,
        upload_date,
        peserta:created_by (
          nama
        )
      `)
      .eq('is_active', true)
      .order('upload_date', { ascending: false })
      .limit(10)
    
    // Calculate estimated total size (if available)
    const { data: filesWithSize } = await supabase
      .from('mediafire_files')
      .select('file_size')
      .eq('is_active', true)
      .not('file_size', 'is', null)
    
    let totalSizeEstimate = 'N/A'
    if (filesWithSize && filesWithSize.length > 0) {
      // Simple estimation - this would need proper size parsing
      totalSizeEstimate = `~${filesWithSize.length} files with size info`
    }
    
    // Get activity stats (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: recentActivity } = await supabase
      .from('mediafire_activity_log')
      .select('action, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(50)
    
    const activityStats = recentActivity?.reduce((acc: any, activity) => {
      acc[(activity as any).action] = (acc[(activity as any).action] || 0) + 1
      return acc
    }, {}) || {}
    
    return NextResponse.json({
      totalFiles: totalFiles || 0,
      totalSizeEstimate,
      categoryBreakdown,
      recentFiles: recentFiles || [],
      activityStats,
      recentActivity: recentActivity || []
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}