import React, { useState, useEffect } from 'react'
import { userService } from '../services/userService'
import { eventService } from '../services/eventService'
import SectionHeading from '../components/SectionHeading'
import toast from 'react-hot-toast'
import { Shield, Users, CalendarDays, AlertCircle } from 'lucide-react'

const AdminDashboard = () => {
  const [users, setUsers] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'users'|'events'>('users')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, eventsRes] = await Promise.all([
          userService.getAdminUsers(),
          eventService.getAdminAll()
        ])
        setUsers(Array.isArray(usersRes.data.results) ? usersRes.data.results : (Array.isArray(usersRes.data) ? usersRes.data : []))
        setEvents(Array.isArray(eventsRes.data.results) ? eventsRes.data.results : (Array.isArray(eventsRes.data) ? eventsRes.data : []))
      } catch (error) {
        toast.error('Failed to load admin data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAdminData()
  }, [])

  const handleToggleUserStatus = async (id: number) => {
    try {
      const { data } = await userService.toggleUserStatus(id)
      setUsers(users.map((u: any) => u.id === id ? { ...u, is_active: data.is_active } : u))
      toast.success(data.message)
    } catch {
      toast.error('Failed to toggle user status')
    }
  }

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event permanently?')) return
    try {
      await eventService.delete(id)
      setEvents(events.filter((e: any) => e.id !== id))
      toast.success('Event deleted')
    } catch {
      toast.error('Failed to delete event')
    }
  }

  return (
    <div className="animate-fade-in pb-12">
      <SectionHeading title="Admin Control Panel" badge="Superuser" align="left" />

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === 'users' ? 'bg-primary-500/20 text-primary-100' : 'text-gray-400 hover:bg-white/5'}`}
        >
          <Users size={20} /> Manage Users
        </button>
        <button 
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === 'events' ? 'bg-primary-500/20 text-primary-100' : 'text-gray-400 hover:bg-white/5'}`}
        >
          <CalendarDays size={20} /> Manage Events
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20">Loading data...</div>
      ) : activeTab === 'users' ? (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-300 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/5">
                    <td className="p-4 font-medium">{u.name}</td>
                    <td className="p-4 text-gray-400">{u.email}</td>
                    <td className="p-4">
                      <span className="badge badge-blush">{u.role}</span>
                    </td>
                    <td className="p-4">
                      <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleToggleUserStatus(u.id)}
                        className={`text-sm font-medium ${u.is_active ? 'text-red-400' : 'text-green-400'}`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-300 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Event Title</th>
                  <th className="p-4 font-medium">Organizer</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map(e => (
                  <tr key={e.id} className="hover:bg-white/5">
                    <td className="p-4 font-medium">{e.title}</td>
                    <td className="p-4 text-gray-400">{e.organizer_name}</td>
                    <td className="p-4">
                      <span className="badge badge-pink">{e.status}</span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-4">
                      <button 
                        onClick={() => handleDeleteEvent(e.id)}
                        className="text-sm font-medium text-red-400 hover:underline flex items-center gap-1"
                      >
                        <AlertCircle size={14} /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
