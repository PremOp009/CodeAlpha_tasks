import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { userService } from '../services/userService'
import { eventService, Event } from '../services/eventService'
import SectionHeading from '../components/SectionHeading'
import EventCard from '../components/EventCard'
import { Ticket, Heart } from 'lucide-react'
import toast from 'react-hot-toast'

const UserDashboard = () => {
  const [bookmarks, setBookmarks] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await userService.getBookmarks()
        setBookmarks(Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []))
      } catch (error) {
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const handleBookmarkToggle = async (id: number) => {
    try {
      const { data } = await userService.toggleBookmark(id)
      if (!data.bookmarked) {
        setBookmarks(prev => prev.filter(e => e.id !== id))
      }
    } catch {
      toast.error('Failed to update bookmark')
    }
  }

  return (
    <div className="animate-fade-in pb-12">
      <SectionHeading 
        title="My Dashboard" 
        subtitle="Manage your saved events and tickets." 
        align="left"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Link to="/my-registrations" className="glass-card p-6 flex items-center gap-6 hover:shadow-glow-primary transition-all group">
          <div className="p-4 bg-primary-500/10 rounded-2xl text-primary-100 group-hover:scale-110 transition-transform">
            <Ticket size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">My Tickets</h3>
            <p className="text-gray-400">View your event registrations and QR codes</p>
          </div>
        </Link>

        <div className="glass-card p-6 flex items-center gap-6">
          <div className="p-4 bg-primary-500/10 rounded-2xl text-primary-100">
            <Heart size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">Saved Events</h3>
            <p className="text-gray-400">{bookmarks.length} events bookmarked</p>
          </div>
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Heart className="text-primary-100 fill-primary-100" /> Bookmarked Events
      </h3>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="glass-card h-[400px] skeleton"></div>)}
        </div>
      ) : bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookmarks.map(event => (
            <EventCard key={event.id} event={event} onBookmarkToggle={handleBookmarkToggle} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Heart size={48} className="mx-auto text-gray-500 mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">No Saved Events</h3>
          <p className="text-gray-400 mb-6">You haven't bookmarked any events yet.</p>
          <Link to="/events" className="btn-secondary">Explore Events</Link>
        </div>
      )}
    </div>
  )
}

export default UserDashboard
