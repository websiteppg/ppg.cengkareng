import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const { data: sessions, error } = await (supabase as any)
      .from('sesi_musyawarah')
      .select('*')
      .order('tanggal', { ascending: false })

    if (error) {
      console.error('Get sessions error:', error)
      return NextResponse.json(
        { error: 'Gagal memuat data sesi' },
        { status: 500 }
      )
    }

    return NextResponse.json(sessions || [])

  } catch (error) {
    console.error('Get sessions API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    
    const { 
      nama_sesi, 
      deskripsi, 
      tanggal, 
      waktu_mulai, 
      waktu_selesai, 
      lokasi, 
      tipe, 
      maksimal_peserta,
      peserta_ids,
      created_by_id // Get from frontend
    } = body

    // Validate required fields
    if (!nama_sesi || !tanggal || !waktu_mulai || !waktu_selesai) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    // Get created_by from request body or find first admin
    let createdBy = created_by_id
    
    if (!createdBy) {
      // Find first admin user as fallback
      const { data: adminUser, error: adminError } = await (supabase as any)
        .from('peserta')
        .select('id')
        .in('role', ['admin', 'super_admin', 'admin_kmm'])
        .eq('aktif', true)
        .limit(1)
        .single()
      
      if (adminUser) {
        createdBy = adminUser.id
      } else {
        // Create default admin if none exists
        const { data: newAdmin, error: createError } = await (supabase as any)
          .from('peserta')
          .insert({
            nama: 'Admin PPG',
            email: 'admin@ppg.id',
            role: 'admin',
            password_hash: 'admin123',
            aktif: true,
            created_at: new Date().toISOString()
          })
          .select('id')
          .single()
        
        if (newAdmin) {
          createdBy = newAdmin.id
        } else {
          return NextResponse.json(
            { error: 'Gagal membuat admin default: ' + (createError?.message || 'Unknown error') },
            { status: 500 }
          )
        }
      }
    }

    // Final validation
    if (!createdBy) {
      return NextResponse.json(
        { error: 'Tidak dapat menentukan pembuat sesi' },
        { status: 400 }
      )
    }

    // Insert session
    const { data: session, error: sessionError } = await (supabase as any)
      .from('sesi_musyawarah')
      .insert({
        nama_sesi: (nama_sesi || 'Sesi Baru').substring(0, 255),
        deskripsi: deskripsi ? deskripsi.substring(0, 500) : null,
        tanggal: tanggal,
        waktu_mulai: waktu_mulai,
        waktu_selesai: waktu_selesai,
        timezone: 'WIB',
        lokasi: lokasi ? lokasi.substring(0, 200) : null,
        tipe: (tipe || 'offline').substring(0, 20),
        status: 'scheduled',
        maksimal_peserta: parseInt(maksimal_peserta) || 100,

        created_by: createdBy
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Create session error:', sessionError)
      return NextResponse.json(
        { error: 'Gagal membuat sesi: ' + sessionError.message },
        { status: 500 }
      )
    }

    // Insert participants if provided
    if (peserta_ids && Array.isArray(peserta_ids) && peserta_ids.length > 0) {
      const sesiPesertaData = peserta_ids.map((peserta_id: string) => ({
        sesi_id: session.id,
        peserta_id,

        created_at: new Date().toISOString()
      }))

      const { error: relationError } = await (supabase as any)
        .from('sesi_peserta')
        .insert(sesiPesertaData)

      if (relationError) {
        console.error('Create session-participant relation error:', relationError)
        // Don't fail the whole operation, just log the error
      }
    }

    return NextResponse.json({
      message: 'Sesi berhasil dibuat',
      data: session
    })

  } catch (error) {
    console.error('Create session API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem: ' + (error as Error).message },
      { status: 500 }
    )
  }
}