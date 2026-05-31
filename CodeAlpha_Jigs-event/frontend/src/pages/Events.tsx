import React, { useState, useEffect } from 'react'
import { eventService, Event, EventFilters } from '../services/eventService'
import { userService } from '../services/userService'
import EventCard from '../components/EventCard'
import SectionHeading from '../components/SectionHeading'
import { Search, Filter, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const categories = ['music', 'tech', 'sports', 'art', 'food', 'business', 'education', 'health', 'fashion', 'comedy', 'other']

const Events = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const { isAuthenticated } = useAuth()
  
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    category: '',
    is_free: undefined,
  })

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const { data } = await eventService.getAll(filters)
      setEvents(Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []))
    } catch (error) {
      toast.error('Failed to load events')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchEvents()
    }, 500)
    return () => clearTimeout(timer)
  }, [filters])

  const handleBookmarkToggle = async (id: number) => {
    if (!isAuthenticated) {
      toast.error('Please login to bookmark events')
      return
    }
    try {
      const { data } = await userService.toggleBookmark(id)
      toast.success(data.message)
      setEvents(events.map(e => e.id === id ? { ...e, is_bookmarked: data.bookmarked } : e))
    } catch (error) {
      toast.error('Failed to bookmark')
    }
  }

  const handleFilterChange = (key: keyof EventFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="animate-fade-in pb-12">
      <SectionHeading 
        title="Explore Events" 
        subtitle="Find the perfect experience tailored to your interests." 
      />

      {/* Search & Filter Bar */}
      <div className="glass-card p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-24 z-30">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search events by title, location..." 
            className="input-field pl-10"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Filter size={20} /> Filters
        </button>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="glass-card p-6 mb-8 animate-slide-up grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Category</label>
            <select 
              className="input-field"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Price Type</label>
            <select 
              className="input-field"
              value={filters.is_free === undefined ? '' : filters.is_free.toString()}
              onChange={(e) => {
                const val = e.target.value
                handleFilterChange('is_free', val === '' ? undefined : val === 'true')
              }}
            >
              <option value="">Any Price</option>
              <option value="true">Free Events</option>
              <option value="false">Paid Events</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => setFilters({ search: '', category: '', is_free: undefined })}
              className="btn-ghost flex items-center gap-2 text-red-400 w-full justify-center h-[50px]"
            >
              <X size={18} /> Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Event Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="glass-card h-[400px] skeleton"></div>
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => (
            <EventCard key={event.id} event={event} onBookmarkToggle={handleBookmarkToggle} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-card">
          <p className="text-xl text-gray-400">No events found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

export default Events
