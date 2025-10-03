import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function checkSuperAdminRole(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Get user ID from request headers or body
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return { authorized: false, error: 'No authorization header' }
    }

    // For now, we'll use a simple approach since we're using localStorage auth
    // In production, you might want to use proper JWT tokens
    const body = await request.json()
    const userId = body.created_by || body.user_id

    if (!userId) {
      return { authorized: false, error: 'No user ID provided' }
    }

    const { data: user, error } = await supabase
      .from('peserta')
      .select('role')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return { authorized: false, error: 'User not found' }
    }

    if ((user as any).role !== 'super_admin') {
      return { authorized: false, error: 'Insufficient permissions' }
    }

    return { authorized: true, user }
  } catch (error) {
    return { authorized: false, error: 'Authentication error' }
  }
}

export function requireSuperAdmin() {
  return async (request: NextRequest) => {
    const authCheck = await checkSuperAdminRole(request)
    
    if (!authCheck.authorized) {
      return Response.json(
        { error: authCheck.error || 'Unauthorized' }, 
        { status: 403 }
      )
    }
    
    return null // Continue to route handler
  }
}