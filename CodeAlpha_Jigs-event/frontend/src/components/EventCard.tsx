import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Clock, MapPin, Heart, CalendarDays } from 'lucide-react'
import { Event } from '../services/eventService'
import { format } from 'date-fns'

interface Props {
  event: Event
  onBookmarkToggle?: (id: number) => void
}

const fallbackImage = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop";

const EventCard: React.FC<Props> = ({ event, onBookmarkToggle }) => {
  const navigate = useNavigate()

  return (
    <div 
      onClick={() => navigate(`/events/${event.id}`)}
      className="glass-card group flex flex-col h-full overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 bg-surface-800/40 hover:border-brand-violet/30 hover:shadow-glow-purple cursor-pointer"
    >
      {/* Image Header */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-surface-900">
        <img
          src={
            event?.image_url && event.image_url.trim() !== ""
              ? event.image_url
              : fallbackImage
          }
          alt={event?.title || "Event image"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100 bg-black"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/20 to-transparent opacity-80" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {event.is_trending && (
            <span className="badge badge-pink backdrop-blur-md bg-surface-900/50">
              🔥 Trending
            </span>
          )}
        </div>

        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          {event.is_free ? (
            <span className="badge badge-green backdrop-blur-md bg-surface-900/50">Free</span>
          ) : (
            <span className="badge badge-purple backdrop-blur-md bg-surface-900/50">₹{event.price}</span>
          )}
          
          {/* Bookmark */}
          {onBookmarkToggle && (
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); onBookmarkToggle(event.id) }}
              className="p-2 rounded-full glass-card hover:bg-white/10 transition-colors mt-1"
            >
              <Heart
                size={16}
                className={event.is_bookmarked ? 'fill-accent-pink text-accent-pink' : 'text-white/70'}
              />
            </button>
          )}
        </div>

        {/* Date */}
        <div className="absolute bottom-3 left-4 flex items-center gap-2 text-white/90 text-sm font-medium">
          <CalendarDays size={16} className="text-accent-purple" />
          {format(new Date(event.date), 'MMM dd, yyyy')}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-grow relative z-10">
        <div className="mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-violet">
            {event.category}
          </span>
        </div>
        
        <h3 className="text-xl font-bold mb-2 text-white line-clamp-1 group-hover:text-accent-pink transition-colors">
          {event.title}
        </h3>
        
        {event.tagline && (
          <p className="text-sm text-text-muted mb-4 line-clamp-2 leading-relaxed">
            {event.tagline}
          </p>
        )}

        <div className="space-y-2 mt-auto text-sm text-text-secondary font-medium">
          <div className="flex items-center gap-2.5">
            <Clock size={15} className="text-white/40" />
            <span>{event.time.substring(0, 5)}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin size={15} className="text-white/40" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="text-xs text-text-muted">
            <span className="text-white font-semibold">{event.available_seats}</span> / {event.max_seats} left
          </div>
          <span className="text-sm font-semibold text-white group-hover:text-accent-purple transition-colors">
            Details &rarr;
          </span>
        </div>
      </div>
    </div>
  )
}

export default EventCard
