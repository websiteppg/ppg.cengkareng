import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      )
    }

    // Debug: Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase env vars:', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey })
      return NextResponse.json(
        { error: 'Konfigurasi database tidak lengkap' },
        { status: 500 }
      )
    }

    const supabase = createServerClient()

    // Debug: Log the query
    console.log('Searching for user:', email)

    // Get user from Supabase database
    const { data: user, error: userError } = await supabase
      .from('peserta')
      .select('id, nama, email, role, password_hash, aktif')
      .eq('email', email)
      .eq('aktif', true)
      .single()

    // Debug: Log the result
    console.log('User query result:', { user, userError })

    if (userError || !user) {
      return NextResponse.json(
        { error: `User tidak ditemukan: ${userError?.message || 'Unknown error'}` },
        { status: 401 }
      )
    }

    // Type assertion for user data
    const userData = user as any
    
    // Debug: Log password comparison
    console.log('Password comparison:', { 
      input: password, 
      stored: userData.password_hash, 
      match: password === userData.password_hash 
    })

    // Simple password comparison - no hashing
    if (password !== userData.password_hash) {
      return NextResponse.json(
        { error: 'Password salah' },
        { status: 401 }
      )
    }

    // Check admin role
    if (!['admin', 'super_admin', 'sekretaris_ppg', 'admin_kmm'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Anda bukan admin.' },
        { status: 403 }
      )
    }

    // Create Supabase auth session
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: password
    })

    if (authError) {
      // If auth fails, try to sign up first then sign in
      const { error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: password,
        options: {
          data: {
            nama: userData.nama,
            role: userData.role
          }
        }
      })
      
      if (!signUpError) {
        const { data: authData2, error: authError2 } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password: password
        })
        
        if (authError2) {
          console.error('Auth error after signup:', authError2)
        }
      }
    }

    // Update last login
    await (supabase as any)
      .from('peserta')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userData.id)

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        nama: userData.nama,
        email: userData.email,
        role: userData.role
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: `Sistem error: ${error}` },
      { status: 500 }
    )
  }
}