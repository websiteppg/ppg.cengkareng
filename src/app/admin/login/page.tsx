'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ArrowLeft } from 'lucide-react'
import { ToastContainer } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { toasts, removeToast, toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Save user data to localStorage with both keys for compatibility
        localStorage.setItem('admin_user', JSON.stringify(data.user))
        localStorage.setItem('user', JSON.stringify(data.user))
        toast.success(`Login berhasil! Selamat datang ${data.user.nama}`)
        
        // Role-based redirect
        let redirectUrl = '/admin'
        if (data.user.role === 'bidang_ppg') {
          redirectUrl = '/admin/program-kerja/bidang'
        } else if (data.user.role === 'admin_kmm') {
          redirectUrl = '/admin/sesi'
        } else if (data.user.role.startsWith('kbm_desa_')) {
          redirectUrl = '/admin/kbm-desa'
        }
        
        setTimeout(() => window.location.href = redirectUrl, 1200)
      } else {
        toast.error(data.error || 'Login gagal')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Beranda
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white shadow-sm">
              <img src="/logo-medium.png" alt="PPG Logo" className="w-14 h-14 object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold">Login Admin</CardTitle>
            <CardDescription>
              Masuk Ke Website Manajemen PPG
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Masukkan username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
              </div>

              <Button type="submit" className="w-full">
                Masuk
              </Button>
            </form>


          </CardContent>
        </Card>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}