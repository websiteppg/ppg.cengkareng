import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const { data: participants, error } = await supabase
      .from('peserta')
      .select('id, nama, email, nomor_hp, jabatan, instansi, role, aktif, created_at')
      .order('nama')

    // Transform data to match expected format
    const transformedParticipants = participants?.map((p: any) => ({
      id: p.id,
      nama: p.nama || '',
      username: p.email || '', // Map email to username
      bidang: p.instansi || '', // Map instansi to bidang
      email: p.email || '',
      nomor_hp: p.nomor_hp || '',
      jabatan: p.jabatan || '',
      instansi: p.instansi || '',
      role: p.role || 'peserta',
      aktif: p.aktif ?? true,
      created_at: p.created_at
    })) || []

    if (error) {
      return NextResponse.json(
        { error: 'Gagal memuat data peserta' },
        { status: 500 }
      )
    }

    return NextResponse.json(transformedParticipants)

  } catch (error) {
    console.error('Get participants error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nama, username, nomor_hp, jabatan, instansi, role } = body

    console.log('Received data:', { nama, username, nomor_hp, jabatan, instansi, role })

    if (!nama || !username) {
      return NextResponse.json(
        { error: 'Nama dan username harus diisi' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['peserta', 'sekretaris_ppg', 'admin_kmm', 'admin', 'super_admin']
    const finalRole = role && validRoles.includes(role) ? role : 'peserta'

    console.log('Final role:', finalRole)

    const supabase = createServerClient()

    // Check if username already exists
    const { data: existingUser } = await (supabase as any)
      .from('peserta')
      .select('id')
      .eq('email', username)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username sudah digunakan' },
        { status: 400 }
      )
    }

    const { data: participant, error } = await (supabase as any)
      .from('peserta')
      .insert({
        nama,
        email: username, // Simpan username ke kolom email
        nomor_hp: nomor_hp || null,
        jabatan: jabatan || null,
        instansi: instansi || null,
        role: finalRole,
        password_hash: 'password123',
        aktif: true,
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: `Gagal menambah peserta: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('Created participant:', participant)
    return NextResponse.json(participant)

  } catch (error) {
    console.error('Create participant error:', error)
    return NextResponse.json(
      { error: `Terjadi kesalahan sistem: ${error}` },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const { nama, email, jabatan, instansi, role, password } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'ID peserta diperlukan' }, { status: 400 })
    }

    if (!nama || !email) {
      return NextResponse.json({ error: 'Nama dan email harus diisi' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check if email already exists for other users
    const { data: existingUser } = await (supabase as any)
      .from('peserta')
      .select('id')
      .eq('email', email)
      .neq('id', id)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah digunakan oleh peserta lain' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = { nama, email, jabatan, instansi, role }
    
    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password_hash = password
    }

    const { data, error } = await (supabase as any)
      .from('peserta')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID peserta diperlukan' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { error } = await (supabase as any)
      .from('peserta')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 })
  }
}