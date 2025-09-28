'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Activity, User, Calendar, FileText } from 'lucide-react'
import RoleGuard from '@/components/admin/role-guard'

interface ActivityLog {
  id: string
  action: string
  user_id: string
  details: any
  ip_address?: string
  user_agent?: string
  created_at: string
  peserta?: {
    nama: string
    email: string
  }
  mediafire_files?: {
    filename: string
  }
}

function ActivityLogContent() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/mediafire-manager/activity')
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities)
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      bulk_delete: 'bg-red-100 text-red-800',
      view: 'bg-gray-100 text-gray-800'
    }
    return colors[action] || 'bg-gray-100 text-gray-800'
  }

  const getActionText = (action: string) => {
    const texts: Record<string, string> = {
      create: 'Created',
      update: 'Updated',
      delete: 'Deleted',
      bulk_delete: 'Bulk Deleted',
      view: 'Viewed'
    }
    return texts[action] || action
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/mediafire-manager">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Manager
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
            <p className="text-gray-600">MediaFire Manager activity history</p>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No activities found
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={getActionBadge(activity.action)}>
                        {getActionText(activity.action)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(activity.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900 mb-2">
                      <span className="font-medium">{activity.peserta?.nama}</span>
                      <span className="text-gray-500"> ({activity.peserta?.email})</span>
                    </div>
                    {activity.details && (
                      <div className="text-sm text-gray-600">
                        {activity.details.filename && (
                          <div>File: <span className="font-medium">{activity.details.filename}</span></div>
                        )}
                        {activity.details.category && (
                          <div>Category: <span className="font-medium">{activity.details.category}</span></div>
                        )}
                        {activity.details.old_filename && activity.details.new_filename && (
                          <div>
                            Renamed from <span className="font-medium">{activity.details.old_filename}</span> to{' '}
                            <span className="font-medium">{activity.details.new_filename}</span>
                          </div>
                        )}
                        {activity.details.bulk_operation && (
                          <div className="text-orange-600">Bulk operation</div>
                        )}
                      </div>
                    )}
                    {activity.ip_address && (
                      <div className="text-xs text-gray-400 mt-2">
                        IP: {activity.ip_address}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ActivityLogPage() {
  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <ActivityLogContent />
    </RoleGuard>
  )
}