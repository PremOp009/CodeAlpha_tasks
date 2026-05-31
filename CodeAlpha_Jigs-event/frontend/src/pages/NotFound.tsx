import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Home } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center animate-fade-in relative z-10 px-4">
      <div className="p-6 bg-primary-500/10 rounded-full mb-8">
        <AlertTriangle size={64} className="text-primary-100" />
      </div>
      <h1 className="text-6xl md:text-8xl font-display font-bold mb-4 gradient-text">404</h1>
      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Page Not Found</h2>
      <p className="text-gray-400 max-w-md mx-auto mb-8 text-lg">
        The event or page you are looking for has vanished into the digital void. Let's get you back on track.
      </p>
      <Link to="/" className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto px-8">
        <Home size={20} /> Back to Homepage
      </Link>
    </div>
  )
}

export default NotFound
