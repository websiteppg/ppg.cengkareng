import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check if admin already exists
    const { data: existingAdmin } = await (supabase as any)
      .from('peserta')
      .select('id')
      .in('role', ['admin', 'super_admin', 'admin_kmm'])
      .eq('aktif', true)
      .limit(1)
      .single()

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin sudah ada',
        admin_id: existingAdmin.id
      })
    }

    // Create default admin
    const { data: admin, error } = await (supabase as any)
      .from('peserta')
      .insert({
        nama: 'Admin PPG',
        email: 'admin@ppg.id',
        nomor_hp: '081234567890',
        jabatan: 'Administrator',
        instansi: 'PPG Pusat',
        role: 'admin',
        password_hash: 'admin123',
        aktif: true,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Create admin error:', error)
      return NextResponse.json(
        { error: 'Gagal membuat admin: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Admin berhasil dibuat',
      admin: {
        id: admin.id,
        nama: admin.nama,
        email: admin.email,
        role: admin.role
      }
    })

  } catch (error) {
    console.error('Setup admin error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}
