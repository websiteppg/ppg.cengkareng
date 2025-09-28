import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { id } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, formatStr: string = "dd/MM/yyyy"): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date'
  }
  return format(dateObj, formatStr, { locale: id })
}

export function formatTime(time: string): string {
  return `${time} WIB`
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date'
  }
  return format(dateObj, "dd/MM/yyyy HH:mm", { locale: id }) + " WIB"
}

export function generateShortLink(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().substring(0, 8).toUpperCase()
  }
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    return '+62' + cleaned.substring(1)
  }
  if (cleaned.startsWith('62')) {
    return '+' + cleaned
  }
  return phone
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'scheduled': 'bg-blue-100 text-blue-800',
    'active': 'bg-green-100 text-green-800',
    'completed': 'bg-gray-100 text-gray-800',
    'cancelled': 'bg-red-100 text-red-800',
    'draft': 'bg-yellow-100 text-yellow-800',
    'pending_approval': 'bg-orange-100 text-orange-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',

  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    'scheduled': 'Terjadwal',
    'active': 'Berlangsung',
    'completed': 'Selesai',
    'cancelled': 'Dibatalkan',
    'draft': 'Draft',
    'pending_approval': 'Menunggu Persetujuan',
    'approved': 'Disetujui',
    'rejected': 'Ditolak',

    'peserta': 'Peserta',
    'sekretaris_ppg': 'Sekretaris PPG',
    'admin': 'Admin',
    'super_admin': 'Super Admin',
  }
  return texts[status] || status
}