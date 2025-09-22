import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'ID sesi tidak valid' },
        { status: 400 }
      )
    }

    // Check if session exists and get ownership info
    const { data: existingSession, error: checkError } = await (supabase as any)
      .from('sesi_musyawarah')
      .select('id, nama_sesi, created_by')
      .eq('id', id)
      .single()

    if (checkError || !existingSession) {
      return NextResponse.json(
        { error: 'Sesi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete related records first (cascade delete)
    // Delete sesi_peserta records
    await (supabase as any)
      .from('sesi_peserta')
      .delete()
      .eq('sesi_id', id)

    // Delete absensi records
    await (supabase as any)
      .from('absensi')
      .delete()
      .eq('sesi_id', id)

    // Delete notulensi records
    await (supabase as any)
      .from('notulensi_sesi')
      .delete()
      .eq('sesi_id', id)

    // Finally delete the session
    const { error: deleteError } = await (supabase as any)
      .from('sesi_musyawarah')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Delete session error:', deleteError)
      return NextResponse.json(
        { error: 'Gagal menghapus sesi' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Sesi berhasil dihapus',
      deletedSession: existingSession
    })

  } catch (error) {
    console.error('Delete session API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params

    // Get session data first
    const { data: sessionData, error: sessionError } = await (supabase as any)
      .from('sesi_musyawarah')
      .select('*')
      .eq('id', id)
      .single()

    if (sessionError) {
      return NextResponse.json(
        { error: 'Sesi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get participants with raw SQL approach
    let participants = []
    try {
      const { data: participantData, error: participantError } = await (supabase as any)
        .rpc('get_session_participants', { session_id: id })
      
      if (participantError) {
        console.log('RPC error, trying direct query:', participantError)
        
        // Fallback to direct query
        const { data: directData } = await (supabase as any)
          .from('sesi_peserta')
          .select('peserta_id')
          .eq('sesi_id', id)
        
        console.log('Direct sesi_peserta data:', directData)
        
        if (directData && directData.length > 0) {
          participants = directData.map((sp: any) => ({
            peserta_id: sp.peserta_id,
            peserta: { id: sp.peserta_id, nama: 'Loading...', email: '' }
          }))
        }
      } else {
        participants = participantData || []
      }
      
      console.log('Final participants:', participants)
    } catch (error) {
      console.log('Error fetching participants:', error)
      participants = []
    }

    // Return session with participants
    return NextResponse.json({
      ...sessionData,
      sesi_peserta: participants
    })

  } catch (error) {
    console.error('Get session API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params
    const body = await request.json()
    const { peserta_ids, ...sessionData } = body

    // Check if session exists and get ownership info
    const { data: existingSession, error: checkError } = await (supabase as any)
      .from('sesi_musyawarah')
      .select('id, created_by')
      .eq('id', id)
      .single()

    if (checkError || !existingSession) {
      return NextResponse.json(
        { error: 'Sesi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Update session data
    const { data, error } = await (supabase as any)
      .from('sesi_musyawarah')
      .update({
        nama_sesi: sessionData.nama_sesi,
        deskripsi: sessionData.deskripsi,
        tanggal: sessionData.tanggal,
        waktu_mulai: sessionData.waktu_mulai,
        waktu_selesai: sessionData.waktu_selesai,
        lokasi: sessionData.lokasi,
        tipe: sessionData.tipe,
        maksimal_peserta: sessionData.maksimal_peserta,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Gagal mengupdate sesi' },
        { status: 500 }
      )
    }

    // Update participants if provided
    if (peserta_ids && Array.isArray(peserta_ids)) {
      // Delete existing participants
      await (supabase as any)
        .from('sesi_peserta')
        .delete()
        .eq('sesi_id', id)

      // Insert new participants
      if (peserta_ids.length > 0) {
        const sesiPesertaData = peserta_ids.map((peserta_id: string) => ({
          sesi_id: id,
          peserta_id,
          wajib_hadir: true,
          created_at: new Date().toISOString()
        }))

        const { error: relationError } = await (supabase as any)
          .from('sesi_peserta')
          .insert(sesiPesertaData)

        if (relationError) {
          console.error('Update session-participant relation error:', relationError)
          return NextResponse.json(
            { error: 'Gagal mengupdate data peserta' },
            { status: 500 }
          )
        }
      }
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Update session API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}