import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { eventService, Event } from '../services/eventService'
import { userService } from '../services/userService'
import EventCard from '../components/EventCard'
import SectionHeading from '../components/SectionHeading'
import {
  ArrowRight, Sparkles, Users, CalendarDays,
  ChevronRight, MapPin, QrCode, BarChart3,
  TrendingUp, Ticket, Zap, Clock
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'

const fallbackImage = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop";

/* ─── Animated Counter ─── */
const AnimatedCounter: React.FC<{ target: number; suffix?: string; duration?: number }> = ({
  target, suffix = '', duration = 2000,
}) => {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

/* ─── Spotlight Hover (cursor glow on element) ─── */
const SpotlightCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [isHover, setIsHover] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className={`relative overflow-hidden ${className}`}
    >
      {isHover && (
        <div
          className="absolute pointer-events-none z-10 transition-opacity duration-300"
          style={{
            width: 300, height: 300,
            left: pos.x - 150, top: pos.y - 150,
            background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />
      )}
      {children}
    </div>
  )
}

/* ─── Marquee ─── */
const marqueeItems = [
  '🤖 AI Events', '🎵 Music Festivals', '💻 Tech Conferences', '🎮 Gaming Tournaments',
  '🚀 Startup Meetups', '🎨 Art Exhibitions', '📸 Photography Walks', '🏆 Hackathons',
  '🎭 Theater Shows', '🎓 Workshops', '🌍 Cultural Events', '⚡ Launch Parties',
]

const Marquee: React.FC = () => (
  <div className="relative overflow-hidden py-6 border-y border-white/5 my-0">
    <div className="flex animate-marquee whitespace-nowrap">
      {[...marqueeItems, ...marqueeItems].map((item, i) => (
        <span key={i} className="mx-8 text-sm font-medium text-white/25 tracking-wide">
          {item}
        </span>
      ))}
    </div>
  </div>
)

/* ─── Floating 3D Ticket ─── */
const FloatingTicket: React.FC = () => {
  return (
    <motion.div
      className="relative w-full max-w-sm mx-auto perspective-[1200px]"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
    >
      <motion.div
        className="relative"
        animate={{ rotateY: [0, 6, -4, 2, 0], rotateX: [0, -4, 3, -2, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Glow behind */}
        <div className="absolute -inset-6 bg-gradient-to-br from-brand-violet/20 via-brand-purple/15 to-brand-pink/10 blur-3xl rounded-3xl animate-pulse-soft opacity-60" />

        {/* Ticket body */}
        <div className="relative glass-card p-5 rounded-2xl border border-white/10 bg-surface-800/60 backdrop-blur-xl overflow-hidden">
          {/* Holographic shimmer */}
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-violet/5 via-transparent to-brand-pink/5 opacity-50" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-brand-purple/8 to-transparent rounded-full blur-2xl" />

          {/* Top bar */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-violet to-brand-pink flex items-center justify-center">
                <Ticket size={14} className="text-white" />
              </div>
              <span className="text-xs font-bold text-white/50 tracking-widest uppercase">Event Pass</span>
            </div>
            <span className="badge badge-purple text-[10px]">VIP</span>
          </div>

          {/* Event info */}
          <div className="relative z-10 mb-4">
            <h4 className="text-lg font-bold text-white mb-1 tracking-tight">AI Summit 2026</h4>
            <div className="space-y-1.5 text-xs text-white/50">
              <div className="flex items-center gap-2"><CalendarDays size={12} className="text-brand-purple" /> June 15, 2026</div>
              <div className="flex items-center gap-2"><MapPin size={12} className="text-brand-pink" /> Convention Center, Mumbai</div>
              <div className="flex items-center gap-2"><Clock size={12} className="text-brand-violet" /> 09:00 AM — 06:00 PM</div>
            </div>
          </div>

          {/* Divider with cutouts */}
          <div className="relative flex items-center my-4">
            <div className="absolute -left-8 w-5 h-5 rounded-full bg-surface-900" />
            <div className="flex-1 border-t border-dashed border-white/10" />
            <div className="absolute -right-8 w-5 h-5 rounded-full bg-surface-900" />
          </div>

          {/* Bottom - QR + attendee */}
          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Attendee</div>
              <div className="text-sm font-semibold text-white">Jigs User</div>
              <div className="flex items-center gap-1 mt-2">
                <Users size={12} className="text-brand-purple" />
                <span className="text-xs text-white/40">2,847 attending</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-lg bg-white/[0.06] border border-white/10 p-2 flex items-center justify-center">
              <QrCode size={36} className="text-brand-purple/60" />
            </div>
          </div>

          {/* Ticket serial */}
          <div className="mt-4 pt-3 border-t border-white/5 text-center">
            <span className="text-[10px] font-mono text-white/20 tracking-[0.3em]">JIGS-2026-VIP-0042</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Dashboard Preview ─── */
const DashboardPreview: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.7, duration: 0.7, ease: 'easeOut' }}
    className="relative max-w-md w-full mx-auto"
  >
    <div className="absolute -inset-4 bg-gradient-to-br from-brand-violet/15 to-brand-pink/10 blur-3xl rounded-3xl opacity-40" />
    <SpotlightCard className="glass-card p-5 rounded-2xl border border-white/10 bg-surface-800/50 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-20">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-brand-purple" />
          <span className="text-sm font-semibold text-white">Dashboard</span>
        </div>
        <span className="badge badge-purple text-[10px] flex items-center gap-1"><Zap size={10} /> Live</span>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3 mb-5 relative z-20">
        {[
          { label: 'Registrations', val: '2.4k', icon: Users, color: 'text-brand-pink' },
          { label: 'Events', val: '18', icon: CalendarDays, color: 'text-brand-purple' },
          { label: 'Revenue', val: '$12k', icon: TrendingUp, color: 'text-brand-violet' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
            <s.icon size={14} className={`${s.color} mx-auto mb-1`} />
            <div className="text-base font-bold text-white">{s.val}</div>
            <div className="text-[10px] text-white/30">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Graph placeholder */}
      <div className="relative z-20 rounded-xl bg-white/[0.02] border border-white/5 p-4 mb-4">
        <div className="text-xs text-white/30 mb-3">Registration trend</div>
        <div className="flex items-end gap-1.5 h-16">
          {[35, 50, 40, 60, 45, 70, 55, 80, 65, 90, 75, 95].map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-brand-violet/40 to-brand-purple/60"
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: 0.8 + i * 0.05, duration: 0.5, ease: 'easeOut' }}
            />
          ))}
        </div>
      </div>

      {/* AI badge */}
      <div className="flex items-center gap-2 text-xs text-white/40 relative z-20">
        <Sparkles size={12} className="text-brand-purple" />
        <span>AI-powered analytics</span>
      </div>
    </SpotlightCard>
  </motion.div>
)

/* ─── Section Wrapper with scroll fade-up ─── */
const FadeSection: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children, className = '', delay = 0,
}) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.section
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: 'easeOut', delay }}
    >
      {children}
    </motion.section>
  )
}

/* ═══════════════════════════════════ HOME ═══════════════════════════════════ */

const Home = () => {
  const [trending, setTrending] = useState<Event[]>([])
  const [featured, setFeatured] = useState<Event[]>([])
  const [recommended, setRecommended] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendRes, featRes] = await Promise.all([
          eventService.getTrending(),
          eventService.getFeatured(),
        ])
        setTrending(Array.isArray(trendRes.data.results) ? trendRes.data.results : (Array.isArray(trendRes.data) ? trendRes.data : []))
        setFeatured(Array.isArray(featRes.data.results) ? featRes.data.results : (Array.isArray(featRes.data) ? featRes.data : []))
        if (isAuthenticated) {
          const recRes = await eventService.getRecommended()
          setRecommended(Array.isArray(recRes.data.results) ? recRes.data.results : (Array.isArray(recRes.data) ? recRes.data : []))
        }
      } catch (error) {
        console.error('Failed to load home data', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [isAuthenticated])

  const handleBookmarkToggle = async (id: number) => {
    if (!isAuthenticated) { toast.error('Please login to bookmark events'); return }
    try {
      const { data } = await userService.toggleBookmark(id)
      toast.success(data.message)
      const update = (list: Event[]) => list.map(e => e.id === id ? { ...e, is_bookmarked: data.bookmarked } : e)
      setTrending(update); setFeatured(update); setRecommended(update)
    } catch { toast.error('Failed to bookmark event') }
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-brand-violet"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0">

      {/* ═══ HERO ═══ */}
      <section className="relative flex flex-col lg:flex-row items-center gap-10 lg:gap-6 min-h-[80vh] pt-6 lg:pt-0 pb-12">
        {/* Ambient hero glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] pointer-events-none z-0">
          <div className="absolute inset-0 bg-hero-gradient opacity-70" />
        </div>

        {/* Left - Text */}
        <div className="flex-1 text-center lg:text-left z-10 w-full max-w-2xl mx-auto lg:mx-0">
          <motion.div
            className="section-label"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles size={12} /> AI-Powered Platform
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-display font-extrabold mb-5 tracking-tight leading-[1.08]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Experience The<br />
            <span className="gradient-text">Extraordinary</span>
          </motion.h1>

          <motion.p
            className="text-base md:text-lg text-white/50 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Discover and register for the most exciting events near you.
            Smart recommendations, instant digital tickets, and seamless experiences.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to="/events" className="btn-primary">
              Explore Events <ArrowRight size={15} />
            </Link>
            {!isAuthenticated && (
              <Link to="/register" state={{ role: 'organizer' }} className="btn-secondary">
                Become Organizer
              </Link>
            )}
          </motion.div>

          {/* Animated Stats */}
          <motion.div
            className="flex items-center justify-center lg:justify-start gap-6 sm:gap-8 mt-14 border-t border-white/5 pt-7"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            {[
              { target: 10000, suffix: '+', label: 'Users' },
              { target: 500, suffix: '+', label: 'Events' },
              { target: 99, suffix: '%', label: 'Satisfaction' },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <div className="w-px h-8 bg-white/10" />}
                <div className="text-center lg:text-left">
                  <div className="text-xl sm:text-2xl font-bold text-white mb-0.5">
                    <AnimatedCounter target={s.target} suffix={s.suffix} />
                  </div>
                  <div className="text-[11px] text-white/30 font-medium uppercase tracking-wider">{s.label}</div>
                </div>
              </React.Fragment>
            ))}
          </motion.div>
        </div>

        {/* Right - Floating Ticket */}
        <div className="flex-1 w-full z-10 hidden lg:flex items-center justify-center">
          <FloatingTicket />
        </div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      <Marquee />

      {/* ═══ TRENDING ═══ */}
      <FadeSection className="pt-20 md:pt-28 relative z-10">
        <div className="flex items-end justify-between mb-8">
          <SectionHeading title="Trending Now" subtitle="Events everyone is talking about." align="left" noMargin />
          <Link to="/events" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-white/40 hover:text-white transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {trending.map((event, i) => (
            <motion.div
              key={event.id}
              className="min-w-[290px] md:min-w-[330px] snap-start shrink-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <EventCard event={event} onBookmarkToggle={handleBookmarkToggle} />
            </motion.div>
          ))}
        </div>
      </FadeSection>

      {/* ═══ FEATURED BENTO ═══ */}
      <FadeSection className="pt-20 md:pt-28 relative z-10">
        <SectionHeading title="Premium Experiences" subtitle="Hand-picked events you don't want to miss." align="left" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[240px]">
          {featured.slice(0, 4).map((event, idx) => (
            <motion.div
              key={event.id}
              className={idx === 0 ? 'md:col-span-2 md:row-span-2' : ''}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Link
                to={`/events/${event.id}`}
                className="group relative w-full h-full rounded-2xl overflow-hidden block border border-white/[0.08] hover:border-brand-violet/30 transition-all duration-300 hover:shadow-glow-purple"
              >
                <img
                  src={
                    event?.image_url && event.image_url.trim() !== ""
                      ? event.image_url
                      : fallbackImage
                  }
                  alt={event?.title || "Event image"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 bg-black"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = fallbackImage;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-900/95 via-surface-900/30 to-transparent" />

                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <span className="badge badge-purple bg-surface-900/50 backdrop-blur-md w-fit mb-2 text-[10px]">{event.category}</span>
                  <h3 className={`${idx === 0 ? 'text-2xl lg:text-3xl' : 'text-lg'} font-bold text-white mb-2 line-clamp-2 leading-tight`}>
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <span className="flex items-center gap-1"><CalendarDays size={12} /> {format(new Date(event.date), 'MMM dd')}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {event.available_seats} left</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </FadeSection>

      {/* ═══ ORGANIZER CTA ═══ */}
      <FadeSection className="pt-20 md:pt-28 relative z-10">
        <SpotlightCard className="rounded-[1.5rem] overflow-hidden border border-brand-violet/15 shadow-glow-purple">
          <div className="glass-card p-8 md:p-12 relative !border-0 !rounded-[1.5rem]">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-violet/8 via-surface-900/80 to-brand-pink/5 pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white tracking-tight">
                  Scale your events<br />with <span className="gradient-text">AI</span>
                </h2>
                <p className="text-base text-white/40 mb-6 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  Create, manage, and grow your events with AI-powered tools.
                  Generate descriptions, manage registrations, and grow your audience.
                </p>
                <Link to="/register" state={{ role: 'organizer' }} className="btn-primary">
                  Start Organizing Today <ArrowRight size={15} />
                </Link>
              </div>

              {/* Dashboard preview */}
              <div className="flex-1 w-full hidden md:block">
                <DashboardPreview />
              </div>
            </div>
          </div>
        </SpotlightCard>
      </FadeSection>

      {/* Spacer before footer */}
      <div className="h-16 md:h-24" />
    </div>
  )
}

export default Home
