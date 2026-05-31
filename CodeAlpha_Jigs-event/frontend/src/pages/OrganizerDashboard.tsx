import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { eventService } from '../services/eventService'
import SectionHeading from '../components/SectionHeading'
import toast from 'react-hot-toast'
import { BarChart3, Users, Calendar, Eye, Activity, Plus, Trash2 } from 'lucide-react'

const OrganizerDashboard = () => {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await eventService.getAnalytics()
        setStats(data)
      } catch (error) {
        toast.error('Failed to load organizer analytics')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return
    
    try {
      await eventService.delete(id)
      toast.success('Event deleted successfully')
      // Update local state by removing the deleted event and updating counters
      setStats((prev: any) => ({
        ...prev,
        total_events: prev.total_events - 1,
        event_stats: prev.event_stats.filter((e: any) => e.id !== id)
      }))
    } catch (error) {
      toast.error('Failed to delete event')
    }
  }

  if (isLoading || !stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-400 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <SectionHeading title="Organizer Dashboard" align="left" />
        <Link to="/events/create" className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Create New Event
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="glass-card p-6 border-l-4 border-primary-400">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Total Events</p>
              <h4 className="text-3xl font-display font-bold">{stats.total_events}</h4>
            </div>
            <div className="p-3 bg-primary-500/10 rounded-lg text-primary-100"><Calendar size={24} /></div>
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Active / Published</p>
              <h4 className="text-3xl font-display font-bold">{stats.published_events}</h4>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><Activity size={24} /></div>
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Total Registrations</p>
              <h4 className="text-3xl font-display font-bold">{stats.total_registrations}</h4>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg text-green-400"><Users size={24} /></div>
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Total Page Views</p>
              <h4 className="text-3xl font-display font-bold">{stats.total_views}</h4>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400"><Eye size={24} /></div>
          </div>
        </div>
      </div>

      {/* Recent Events Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2"><BarChart3 size={20} /> Event Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-300 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Event Title</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Registrations</th>
                <th className="p-4 font-medium">Views</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.event_stats && Array.isArray(stats.event_stats) && stats.event_stats.length > 0 ? stats.event_stats.map((ev: any) => (
                <tr key={ev.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium">{ev.title}</td>
                  <td className="p-4 text-gray-400">{ev.date}</td>
                  <td className="p-4">
                    <span className={`badge ${ev.status === 'published' ? 'badge-green' : 'badge-yellow'}`}>
                      {ev.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-700 rounded-full h-2 max-w-[100px]">
                        <div 
                          className="bg-primary-500 h-2 rounded-full" 
                          style={{ width: `${(ev.registrations / ev.max_seats) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-400">{ev.registrations}/{ev.max_seats}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400">{ev.views}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link to={`/events/${ev.id}`} className="text-primary-100 hover:underline text-sm font-medium">View</Link>
                      <button onClick={() => handleDelete(ev.id)} className="text-red-400 hover:text-red-300 transition-colors" title="Delete Event">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No events found. Start by creating one!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default OrganizerDashboard
