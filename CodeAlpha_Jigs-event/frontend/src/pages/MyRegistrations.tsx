import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { registrationService, Registration } from '../services/registrationService'
import SectionHeading from '../components/SectionHeading'
import { Calendar, MapPin, Download, XCircle, Ticket } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const fallbackImage = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop";

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState<number | null>(null)

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      const { data } = await registrationService.getMyRegistrations()
      setRegistrations(Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []))
    } catch (error) {
      toast.error('Failed to load tickets')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) return
    setIsCancelling(id)
    try {
      await registrationService.cancelRegistration(id)
      toast.success('Registration cancelled')
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r))
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel')
    } finally {
      setIsCancelling(null)
    }
  }

  const handleDownloadQR = (url: string, ticketId: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `JigsEvent-Ticket-${ticketId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="animate-fade-in pb-12">
      <SectionHeading 
        title="My Tickets" 
        subtitle="Manage your event registrations and download QR codes." 
        align="left"
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-400 border-t-transparent" />
        </div>
      ) : registrations.length > 0 ? (
        <div className="space-y-6">
          {registrations.map(reg => (
            <div key={reg.id} className="glass-card flex flex-col md:flex-row overflow-hidden relative">
              
              {/* Event Info */}
              <div className="flex-grow p-6 flex flex-col md:flex-row gap-6">
                <img 
                  src={
                    reg.event.image_url && reg.event.image_url.trim() !== ""
                      ? reg.event.image_url
                      : fallbackImage
                  }
                  alt={reg.event.title || "Event image"}
                  className="w-full md:w-48 h-32 object-cover rounded-xl bg-black"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = fallbackImage;
                  }}
                />
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`badge ${
                      reg.status === 'confirmed' ? 'badge-green' : 
                      reg.status === 'cancelled' ? 'badge-red' : 
                      'badge-yellow'
                    }`}>
                      {reg.status.toUpperCase()}
                    </span>
                    <span className="text-sm font-mono text-gray-400">ID: {reg.ticket_id}</span>
                  </div>
                  <Link to={`/events/${reg.event.id}`} className="text-2xl font-bold hover:text-primary-100 transition-colors mb-2">
                    {reg.event.title}
                  </Link>
                  <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} /> {format(new Date(reg.event.date), 'MMM d, yyyy')} • {reg.event.time.substring(0,5)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={16} /> {reg.event.venue || reg.event.location}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions / QR */}
              <div className="border-t md:border-t-0 md:border-l border-white/10 p-6 flex flex-row md:flex-col justify-between md:justify-center items-center gap-4 bg-white/5 min-w-[200px]">
                {reg.status === 'confirmed' && reg.qr_code_url ? (
                  <>
                    <img src={reg.qr_code_url} alt="QR Code" className="w-24 h-24 bg-white p-2 rounded-lg" />
                    <button 
                      onClick={() => handleDownloadQR(reg.qr_code_url!, reg.ticket_id)}
                      className="btn-secondary w-full flex items-center justify-center gap-2 text-sm py-2"
                    >
                      <Download size={16} /> Save Ticket
                    </button>
                    <button 
                      onClick={() => handleCancel(reg.id)}
                      disabled={isCancelling === reg.id}
                      className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition-colors"
                    >
                      <XCircle size={16} /> {isCancelling === reg.id ? 'Cancelling...' : 'Cancel Registration'}
                    </button>
                  </>
                ) : (
                  <div className="text-center text-gray-500 w-full">
                    {reg.status === 'cancelled' ? 'Ticket Cancelled' : 'Ticket Pending'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <Ticket size={48} className="mx-auto text-gray-500 mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">No Tickets Yet</h3>
          <p className="text-gray-400 mb-6">You haven't registered for any events.</p>
          <Link to="/events" className="btn-primary inline-block">Browse Events</Link>
        </div>
      )}
    </div>
  )
}

export default MyRegistrations
