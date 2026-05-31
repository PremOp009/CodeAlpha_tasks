import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react'

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll for sticky navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'admin') return '/admin'
    if (user.role === 'organizer') return '/organizer'
    return '/dashboard'
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'pt-2' : 'pt-4'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'glass-card py-2 px-6 shadow-card' : 'py-3 px-2 bg-transparent'
        } rounded-2xl`}>
          
          {/* Logo */}
          <Link to="/" className="text-2xl font-display font-bold tracking-tight text-white hover:opacity-80 transition-opacity flex items-center gap-3">
            <img src="/logo.png" alt="Jigs Events" className="w-12 h-12 object-contain drop-shadow-lg" />
            <span className="mt-1">Jigs Events</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/events" className="btn-ghost">Explore</Link>
            
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="btn-ghost">Dashboard</Link>
                <Link to="/my-registrations" className="btn-ghost">Tickets</Link>
                
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
                  <Link to="/profile" className="flex items-center gap-2 btn-ghost !px-2">
                    {user?.profile_image ? (
                      <img src={user.profile_image} alt={user.name} className="w-6 h-6 rounded-full object-cover border border-white/10" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                        <UserIcon size={14} className="text-white/70" />
                      </div>
                    )}
                    <span className="max-w-[100px] truncate text-sm text-white/90">{user?.name}</span>
                  </Link>
                  
                  <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors" title="Logout">
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
                <Link to="/login" className="btn-ghost">Log in</Link>
                <Link to="/register" className="btn-primary !px-4 !py-2 !text-xs">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 md:hidden text-white/70 hover:text-white transition-colors">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-2 p-4 glass-card flex flex-col gap-2 shadow-card-hover animate-fade-in border border-white/10">
          <Link to="/events" className="btn-ghost justify-start w-full">Explore Events</Link>
          <hr className="divider my-1" />
          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()} className="btn-ghost justify-start w-full">Dashboard</Link>
              <Link to="/my-registrations" className="btn-ghost justify-start w-full">My Tickets</Link>
              <Link to="/profile" className="btn-ghost justify-start w-full">Profile</Link>
              <hr className="divider my-1" />
              <button onClick={handleLogout} className="btn-ghost justify-start w-full text-red-400 hover:text-red-300">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost justify-start w-full">Log in</Link>
              <Link to="/register" className="btn-primary w-full mt-2">Sign up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
