import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    const { data: meetingNotes, error } = await supabase
      .from('notulensi_sesi')
      .select(`
        id,
        judul,
        status,
        version,
        created_at,
        updated_at,
        sesi:sesi_id(nama_sesi, tanggal, waktu_mulai),
        dibuat_oleh:dibuat_oleh(nama),
        disetujui_oleh:disetujui_oleh(nama)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Gagal memuat data notulensi' },
        { status: 500 }
      )
    }

    return NextResponse.json(meetingNotes || [])

  } catch (error) {
    console.error('Get meeting notes error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    
    const { 
      sesi_id, 
      judul, 
      isi_notulensi, 
      kesimpulan, 
      tindak_lanjut,
      dibuat_oleh_id
    } = body
    
    // Validate required fields
    if (!sesi_id || !judul) {
      return NextResponse.json(
        { error: 'Sesi ID dan judul wajib diisi' },
        { status: 400 }
      )
    }
    
    // Get created_by from request body or find first admin
    let createdBy = dibuat_oleh_id
    
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
        { error: 'Tidak dapat menentukan pembuat notulensi' },
        { status: 400 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('notulensi_sesi')
      .insert({
        sesi_id: sesi_id,
        judul: judul,
        agenda: isi_notulensi || '',
        pembahasan: isi_notulensi || '',
        keputusan: kesimpulan || '',
        tindak_lanjut: tindak_lanjut || '',
        status: 'draft',
        version: 1,
        dibuat_oleh: createdBy
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Gagal membuat notulensi' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Create meeting note error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}
