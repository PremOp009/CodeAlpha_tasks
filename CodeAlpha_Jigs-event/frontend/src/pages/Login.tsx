import React, { useState } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Mail, Lock, ArrowRight } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (user) {
    const dashboardPath = user.role === 'admin' ? '/admin' : user.role === 'organizer' ? '/organizer' : '/dashboard'
    return <Navigate to={dashboardPath} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      
      // Redirect to intended page or dashboard
      const from = (location.state as any)?.from?.pathname || '/'
      navigate(from, { replace: true })
      
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-fade-in relative z-10">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to manage your tickets and events</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="email" 
                required
                className="input-field pl-10" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="password" 
                required
                className="input-field pl-10" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? 'Signing in...' : (
              <>Sign In <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-100 font-semibold hover:underline">
            Create one
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Login
