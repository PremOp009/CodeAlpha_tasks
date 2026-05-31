import api from './api'

export interface Event {
  id: number
  title: string
  tagline?: string
  description: string
  category: string
  date: string
  time: string
  end_time?: string
  location: string
  venue?: string
  image_url?: string
  organizer_name?: string
  organizer?: { id: number; name: string; email: string; profile_image?: string }
  max_seats: number
  available_seats: number
  registration_count: number
  is_sold_out: boolean
  is_upcoming: boolean
  price: number
  is_free: boolean
  status: string
  is_featured: boolean
  is_trending: boolean
  views_count: number
  is_bookmarked: boolean
  highlights?: string[]
  seo_summary?: string
  user_registration_status?: { registered: boolean; status?: string; ticket_id?: string }
  created_at: string
}

export interface EventFilters {
  search?: string
  category?: string
  date_from?: string
  date_to?: string
  location?: string
  is_free?: boolean
  ordering?: string
  page?: number
}

export const eventService = {
  getAll: (filters: EventFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.append(k, String(v))
    })
    return api.get(`/events?${params.toString()}`)
  },
  getById: (id: number) => api.get(`/events/${id}`),
  getTrending: () => api.get('/events/trending'),
  getFeatured: () => api.get('/events/featured'),
  getRecommended: () => api.get('/events/recommended'),
  getMyEvents: () => api.get('/events/my-events'),
  getAnalytics: () => api.get('/events/analytics'),
  getAttendees: (id: number) => api.get(`/events/${id}/attendees`),
  getAdminAll: () => api.get('/events/admin/all'),
  create: async (data: FormData) => {
    const token = localStorage.getItem('jigs_access');
    const res = await fetch(`${api.defaults.baseURL}/events/create`, {
      method: 'POST',
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
      body: data
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }
    return { data: await res.json() };
  },
  update: async (id: number, data: FormData) => {
    const token = localStorage.getItem('jigs_access');
    const res = await fetch(`${api.defaults.baseURL}/events/${id}/update/`, {
      method: 'PATCH',
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
      body: data
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw { response: { data: errorData } };
    }
    return { data: await res.json() };
  },
  delete: (id: number) => api.delete(`/events/${id}/delete/`),
}

export const aiService = {
  generateDescription: (idea: string) => api.post('/ai/generate-description', { idea }),
}
