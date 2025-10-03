import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password harus diisi' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Find user by email/username with viewer role only
    const { data: user, error } = await (supabase as any)
      .from('peserta')
      .select('id, nama, email, role, password_hash, aktif')
      .eq('email', username)
      .eq('role', 'viewer')
      .eq('aktif', true)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Username tidak ditemukan atau bukan viewer' },
        { status: 401 }
      )
    }

    // Simple password check (in production, use proper hashing)
    if (user.password_hash !== password) {
      return NextResponse.json(
        { error: 'Password salah' },
        { status: 401 }
      )
    }

    // Update last login
    await (supabase as any)
      .from('peserta')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // Return user data (exclude password)
    const userData = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role
    }

    return NextResponse.json({
      success: true,
      user: userData,
      message: 'Login berhasil'
    })

  } catch (error) {
    console.error('Viewer login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}