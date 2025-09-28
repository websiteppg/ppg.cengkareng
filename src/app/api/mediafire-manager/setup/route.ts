import { NextResponse } from 'next/server'

export async function GET() {
  const sqlScript = `
-- Create table mediafire_files for MediaFire Link Manager
CREATE TABLE IF NOT EXISTS mediafire_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  mediafire_url TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'Others',
  description TEXT,
  file_size VARCHAR(50),
  file_type VARCHAR(50),
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES peserta(id),
  tags JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity log table for MediaFire operations
CREATE TABLE IF NOT EXISTS mediafire_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID REFERENCES mediafire_files(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  user_id UUID NOT NULL REFERENCES peserta(id),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for mediafire_files
CREATE INDEX IF NOT EXISTS idx_mediafire_files_created_by ON mediafire_files(created_by);
CREATE INDEX IF NOT EXISTS idx_mediafire_files_category ON mediafire_files(category);
CREATE INDEX IF NOT EXISTS idx_mediafire_files_is_active ON mediafire_files(is_active);
CREATE INDEX IF NOT EXISTS idx_mediafire_files_upload_date ON mediafire_files(upload_date);

-- Create index for activity log
CREATE INDEX IF NOT EXISTS idx_mediafire_activity_log_user_id ON mediafire_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_mediafire_activity_log_action ON mediafire_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_mediafire_activity_log_created_at ON mediafire_activity_log(created_at);
  `

  return NextResponse.json({
    message: 'Copy and run this SQL script in Supabase SQL Editor',
    sql: sqlScript,
    instructions: [
      '1. Login to Supabase Dashboard',
      '2. Go to SQL Editor',
      '3. Copy the SQL script above',
      '4. Paste and run it',
      '5. Refresh MediaFire Manager page'
    ]
  })
}