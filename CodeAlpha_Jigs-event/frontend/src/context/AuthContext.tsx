import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../services/api'

interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'organizer' | 'admin'
  profile_image?: string | null
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, password2: string, role?: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('jigs_user')
    const token = localStorage.getItem('jigs_access')
    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('jigs_access', data.access)
    localStorage.setItem('jigs_refresh', data.refresh)
    localStorage.setItem('jigs_user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const register = async (
    name: string, email: string, password: string,
    password2: string, role = 'user'
  ) => {
    const { data } = await api.post('/auth/register', { name, email, password, password2, role })
    localStorage.setItem('jigs_access', data.access)
    localStorage.setItem('jigs_refresh', data.refresh)
    localStorage.setItem('jigs_user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('jigs_refresh')
      if (refresh) await api.post('/auth/logout', { refresh })
    } catch { /* ignore */ }
    localStorage.removeItem('jigs_access')
    localStorage.removeItem('jigs_refresh')
    localStorage.removeItem('jigs_user')
    setUser(null)
  }

  const updateUser = (data: Partial<User>) => {
    if (!user) return
    const updated = { ...user, ...data }
    setUser(updated)
    localStorage.setItem('jigs_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
