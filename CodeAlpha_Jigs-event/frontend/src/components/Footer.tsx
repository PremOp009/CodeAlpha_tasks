import React from 'react'
import { Link } from 'react-router-dom'
import { Twitter, Instagram, Github, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-surface-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="text-2xl font-display font-bold tracking-tight text-white flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Jigs Events" className="w-14 h-14 object-contain drop-shadow-lg" />
              <span className="mt-1">Jigs Events</span>
            </Link>
            <p className="text-sm text-text-muted mb-6 max-w-xs">
              Discover, Register, Experience. The modern platform for the best events.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-text-muted hover:text-white transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-text-muted hover:text-white transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-text-muted hover:text-white transition-colors">
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-text-muted">
              <li><Link to="/events" className="hover:text-accent-pink transition-colors">Explore Events</Link></li>
              <li><Link to="/register" state={{ role: 'organizer' }} className="hover:text-accent-pink transition-colors">Become Organizer</Link></li>
              <li><Link to="#" className="hover:text-accent-pink transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-text-muted">
              <li><Link to="#" className="hover:text-accent-pink transition-colors">Help Center</Link></li>
              <li><Link to="#" className="hover:text-accent-pink transition-colors">Documentation</Link></li>
              <li><Link to="#" className="hover:text-accent-pink transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-text-muted">
              <li className="flex items-center gap-2"><Mail size={14} /> hello@jigsevents.com</li>
              <li><Link to="#" className="hover:text-accent-pink transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-accent-pink transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted">
          <div>
            &copy; {new Date().getFullYear()} Jigs Events Inc. All rights reserved.
          </div>
          <div className="flex gap-4">
            <span>Designed with AI</span>
            <span className="w-1 h-1 rounded-full bg-accent-purple self-center"></span>
            <span>Built for the future</span>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer
