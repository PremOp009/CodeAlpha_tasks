import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { eventService, Event } from '../services/eventService'
import { registrationService } from '../services/registrationService'
import { userService } from '../services/userService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Calendar, Clock, MapPin, Users, Heart, Share2, Ticket, CheckCircle2, CreditCard, IndianRupee } from 'lucide-react'
import { format } from 'date-fns'

// Razorpay global type declaration
declare global {
  interface Window {
    Razorpay: any
  }
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await eventService.getById(Number(id))
        setEvent(data)
      } catch (error) {
        toast.error('Event not found')
        navigate('/events')
      } finally {
        setIsLoading(false)
      }
    }
    if (id) fetchEvent()
  }, [id, navigate])

  // ── Free event registration ──────────────────────────────────────────────────
  const handleFreeRegister = async () => {
    setIsRegistering(true)
    try {
      await registrationService.register(Number(id))
      toast.success('Successfully registered! Check your tickets.')
      setEvent(prev => prev ? {
        ...prev,
        available_seats: prev.available_seats - 1,
        user_registration_status: { registered: true, status: 'confirmed' }
      } : null)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed')
    } finally {
      setIsRegistering(false)
    }
  }

  // ── Paid event — Razorpay checkout ──────────────────────────────────────────
  const handlePaidRegister = async () => {
    if (!window.Razorpay) {
      toast.error('Payment gateway not loaded. Please refresh the page.')
      return
    }

    setIsRegistering(true)

    try {
      // 1. Create a Razorpay order on the backend
      const { data: orderData } = await registrationService.createPaymentOrder(Number(id))

      // 2. Configure and open Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,          // in paise
        currency: orderData.currency,      // 'INR'
        order_id: orderData.order_id,
        name: 'Jigs Events',
        description: orderData.event_title,
        image: 'https://ui-avatars.com/api/?name=JE&background=8b5cf6&color=fff&size=80',
        prefill: {
          name: orderData.user_name,
          email: orderData.user_email,
        },
        theme: { color: '#8b5cf6' },
        modal: {
          ondismiss: () => {
            setIsRegistering(false)
            toast('Payment cancelled.', { icon: '⚠️' })
          },
        },
        handler: async (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          // 3. Verify payment on backend and create registration
          try {
            await registrationService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              event_id: Number(id),
            })
            toast.success('🎉 Payment successful! Your ticket has been booked.')
            setEvent(prev => prev ? {
              ...prev,
              available_seats: prev.available_seats - 1,
              user_registration_status: { registered: true, status: 'confirmed' }
            } : null)
          } catch (verifyError: any) {
            toast.error(verifyError.response?.data?.error || 'Payment verification failed.')
          } finally {
            setIsRegistering(false)
          }
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response: any) => {
        setIsRegistering(false)
        toast.error(`Payment failed: ${response.error.description}`)
      })
      rzp.open()

    } catch (error: any) {
      setIsRegistering(false)
      toast.error(error.response?.data?.error || 'Could not initiate payment. Please try again.')
    }
  }

  // ── Main register handler ────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } })
      return
    }
    if (event?.user_registration_status?.registered) {
      navigate('/my-registrations')
      return
    }

    if (event?.is_free) {
      await handleFreeRegister()
    } else {
      await handlePaidRegister()
    }
  }

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to bookmark events')
      return
    }
    try {
      const { data } = await userService.toggleBookmark(Number(id))
      toast.success(data.message)
      setEvent(prev => prev ? { ...prev, is_bookmarked: data.bookmarked } : null)
    } catch (error) {
      toast.error('Failed to bookmark')
    }
  }

  if (isLoading || !event) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-400 border-t-transparent" />
      </div>
    )
  }

  const defaultImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200'
  const isRegistered = event.user_registration_status?.registered

  // Register button label
  const getRegisterLabel = () => {
    if (isRegistering) return event.is_free ? 'Registering...' : 'Processing Payment...'
    if (event.is_free) return 'Register Now — Free'
    return `Pay ₹${event.price} & Register`
  }

  return (
    <div className="animate-fade-in pb-12">
      
      {/* Hero Header */}
      <div className="relative h-[40vh] md:h-[50vh] rounded-3xl overflow-hidden mb-12 shadow-2xl">
        <img 
          src={event.image_url || defaultImage} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="badge badge-pink">{event.category.toUpperCase()}</span>
            {event.is_trending && <span className="badge badge-pink">🔥 Trending</span>}
            {event.is_free ? (
              <span className="badge badge-green">Free Entry</span>
            ) : (
              <span className="badge badge-yellow flex items-center gap-1">
                <IndianRupee size={12} />
                {event.price}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-2">{event.title}</h1>
          {event.tagline && <p className="text-xl text-gray-300 max-w-3xl">{event.tagline}</p>}
        </div>

        {/* Floating Action Bar */}
        <div className="absolute top-6 right-6 flex gap-3">
          <button onClick={handleBookmarkToggle} className="p-3 rounded-full glass-card hover:bg-white/20 transition-colors">
            <Heart className={event.is_bookmarked ? 'fill-primary-400 text-primary-400' : 'text-white'} />
          </button>
          <button onClick={() => {
            navigator.clipboard.writeText(window.location.href)
            toast.success('Link copied to clipboard!')
          }} className="p-3 rounded-full glass-card hover:bg-white/20 transition-colors">
            <Share2 className="text-white" />
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          
          <section className="glass-card p-8">
            <h2 className="text-2xl font-bold mb-4">About This Event</h2>
            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </div>
          </section>

          {Array.isArray(event.highlights) && event.highlights.length > 0 && (
            <section className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-4">Highlights</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-primary-100 mt-1 flex-shrink-0" size={20} />
                    <span className="text-gray-300">{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="glass-card p-8 flex items-center gap-6">
            <img 
              src={event.organizer?.profile_image || `https://ui-avatars.com/api/?name=${event.organizer?.name}&background=FFB9B9&color=fff`} 
              alt={event.organizer?.name} 
              className="w-16 h-16 rounded-full border-2 border-primary-100"
            />
            <div>
              <p className="text-sm text-gray-400 mb-1">Organized by</p>
              <h3 className="text-xl font-bold">{event.organizer?.name}</h3>
            </div>
          </section>

        </div>

        {/* Right Column: Sticky Ticket Box */}
        <div className="space-y-6">
          <div className="glass-card p-8 sticky top-28">
            <h3 className="text-2xl font-bold mb-6">Date & Time</h3>
            
            <div className="space-y-5 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-500/10 rounded-xl text-primary-100">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="font-semibold">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
                  <p className="text-sm text-gray-400">
                    {event.time.substring(0, 5)} {event.end_time ? `- ${event.end_time.substring(0, 5)}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-500/10 rounded-xl text-primary-100">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="font-semibold">{event.venue || event.location}</p>
                  <p className="text-sm text-gray-400">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-500/10 rounded-xl text-primary-100">
                  <Users size={24} />
                </div>
                <div>
                  <p className="font-semibold">{event.available_seats} Seats Available</p>
                  <p className="text-sm text-gray-400">out of {event.max_seats} total</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg text-gray-300">Price</span>
                <span className="text-3xl font-display font-bold gradient-text flex items-center gap-1">
                  {event.is_free ? (
                    'Free'
                  ) : (
                    <>
                      <IndianRupee size={24} className="inline" />
                      {event.price}
                    </>
                  )}
                </span>
              </div>

              {/* Razorpay secure badge for paid events */}
              {!event.is_free && !isRegistered && (
                <div className="flex items-center justify-center gap-2 mb-4 text-xs text-gray-500">
                  <CreditCard size={14} />
                  <span>Secured by Razorpay</span>
                </div>
              )}

              {user?.id === event.organizer?.id ? (
                <Link to={`/events/${event.id}/edit`} className="btn-secondary w-full block text-center">
                  Edit Event
                </Link>
              ) : isRegistered ? (
                <Link to="/my-registrations" className="btn-secondary w-full flex items-center justify-center gap-2 text-green-400 border-green-400/30 hover:bg-green-400/10">
                  <Ticket size={20} /> View Ticket
                </Link>
              ) : event.is_sold_out ? (
                <button disabled className="w-full py-4 rounded-xl font-bold bg-white/5 text-gray-500 cursor-not-allowed">
                  Sold Out
                </button>
              ) : event.status !== 'published' ? (
                <button disabled className="w-full py-4 rounded-xl font-bold bg-white/5 text-gray-500 cursor-not-allowed">
                  Not Available
                </button>
              ) : (
                <button 
                  onClick={handleRegister}
                  disabled={isRegistering}
                  className="btn-primary w-full py-4 text-lg shadow-glow-primary flex items-center justify-center gap-2"
                  id="register-btn"
                >
                  {!isRegistering && !event.is_free && <CreditCard size={20} />}
                  {getRegisterLabel()}
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default EventDetail
