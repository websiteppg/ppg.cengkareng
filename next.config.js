/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-supabase-project.supabase.co'],
  },
  env: {
    TIMEZONE: 'Asia/Jakarta',
    MAX_PARTICIPANTS: '100',
  },
}

module.exports = nextConfig