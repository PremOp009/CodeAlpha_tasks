import api from './api'

export const userService = {
  getProfile: () => api.get('/auth/profile'),
  updateProfile: async (data: FormData) => {
    const token = localStorage.getItem('jigs_access');
    const res = await fetch(`${api.defaults.baseURL}/auth/profile`, {
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
  changePassword: (data: any) => api.post('/auth/change-password', data),
  toggleBookmark: (eventId: number) => api.post(`/auth/bookmark/${eventId}`),
  getBookmarks: () => api.get('/auth/bookmarks'),
  getAdminUsers: () => api.get('/auth/admin/users'),
  toggleUserStatus: (userId: number) => api.post(`/auth/admin/users/${userId}/toggle-status`),
}
