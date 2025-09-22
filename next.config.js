/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'foozwfyfgqtgofffnqbq.supabase.co'],
  },
  env: {
    TIMEZONE: 'Asia/Jakarta',
    MAX_PARTICIPANTS: '100',
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  }
}

module.exports = nextConfig