import React, { useState } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Mail, Lock, User as UserIcon, Shield, ArrowRight } from 'lucide-react'

const Register = () => {
  const location = useLocation()
  const initialRole = (location.state as any)?.role || 'user'
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', password2: '', role: initialRole
  })
  const [isLoading, setIsLoading] = useState(false)
  const { register, user } = useAuth()
  const navigate = useNavigate()

  if (user) {
    const dashboardPath = user.role === 'admin' ? '/admin' : user.role === 'organizer' ? '/organizer' : '/dashboard'
    return <Navigate to={dashboardPath} replace />
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.password2) {
      toast.error('Passwords do not match')
      return
    }
    setIsLoading(true)
    try {
      await register(formData.name, formData.email, formData.password, formData.password2, formData.role)
      toast.success('Account created successfully!')
      if (formData.role === 'organizer') {
        navigate('/organizer')
      } else {
        navigate('/')
      }
    } catch (error: any) {
      const errs = error.response?.data
      if (errs) {
        Object.keys(errs).forEach(k => toast.error(`${k}: ${errs[k]}`))
      } else {
        toast.error('Registration failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-fade-in py-12 relative z-10">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">Join Jigs Events</h1>
          <p className="text-gray-400">Create an account to start your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" name="name" required
                className="input-field pl-10" placeholder="John Doe"
                value={formData.name} onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="email" name="email" required
                className="input-field pl-10" placeholder="you@example.com"
                value={formData.email} onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Role</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select 
                name="role"
                className="input-field pl-10 appearance-none"
                value={formData.role} onChange={handleChange}
              >
                <option value="user">Attendee</option>
                <option value="organizer">Event Organizer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="password" name="password" required minLength={8}
                className="input-field pl-10" placeholder="••••••••"
                value={formData.password} onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="password" name="password2" required minLength={8}
                className="input-field pl-10" placeholder="••••••••"
                value={formData.password2} onChange={handleChange}
              />
            </div>
          </div>

          <button 
            type="submit" disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? 'Creating Account...' : (
              <>Sign Up <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-100 font-semibold hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Register
