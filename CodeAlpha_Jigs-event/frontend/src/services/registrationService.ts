import api from './api'
import { Event } from './eventService'

export interface Registration {
  id: number
  event: Event
  registration_date: string
  status: string
  ticket_id: string
  qr_code_url?: string
  updated_at: string
}

export interface RegistrationDetail extends Registration {
  user: { id: number; name: string; email: string; profile_image?: string }
  event_title: string
  event_date: string
  notes?: string
}

export interface PaymentOrder {
  order_id: string
  amount: number        // in paise
  currency: string      // 'INR'
  key: string
  event_title: string
  event_id: number
  user_name: string
  user_email: string
}

export interface PaymentVerifyPayload {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  event_id: number
}

export const registrationService = {
  // Free event registration
  register: (eventId: number) => api.post(`/register-event/${eventId}`),

  // Paid event — Razorpay flow
  createPaymentOrder: (eventId: number) =>
    api.post<PaymentOrder>('/payment/create-order', { event_id: eventId }),
  verifyPayment: (payload: PaymentVerifyPayload) =>
    api.post('/payment/verify', payload),

  // User registration management
  getMyRegistrations: () => api.get('/my-registrations'),
  cancelRegistration: (id: number) => api.delete(`/cancel-registration/${id}`),
  getDetail: (id: number) => api.get(`/registration/${id}`),
  updateStatus: (id: number, status: string, notes?: string) =>
    api.patch(`/registration/${id}/status`, { status, notes }),
  verifyTicket: (ticketId: string) => api.post('/verify-ticket', { ticket_id: ticketId }),
}
