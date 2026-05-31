import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { eventService } from '../services/eventService'
import SectionHeading from '../components/SectionHeading'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'

const EditEvent = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    title: '', tagline: '', description: '', category: 'other',
    date: '', time: '', end_time: '', location: '', venue: '',
    max_seats: 100, price: 0, is_free: true, status: 'draft',
  })

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await eventService.getById(Number(id))
        setFormData({
          title: data.title, tagline: data.tagline || '', description: data.description,
          category: data.category, date: data.date, time: data.time.substring(0,5),
          end_time: data.end_time ? data.end_time.substring(0,5) : '', 
          location: data.location, venue: data.venue || '', max_seats: data.max_seats,
          price: Number(data.price), is_free: data.is_free, status: data.status,
        })
      } catch (error) {
        toast.error('Failed to load event data')
        navigate('/organizer')
      } finally {
        setIsFetching(false)
      }
    }
    if (id) fetchEvent()
  }, [id, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value === '') return; // Skip empty strings to prevent 400 Bad Request on optional fields like end_time
        submitData.append(key, String(value))
      })
      if (imageFile) submitData.append('image', imageFile)

      await eventService.update(Number(id), submitData)
      toast.success('Event updated successfully!')
      navigate(`/events/${id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update event')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) return <div className="text-center py-20">Loading event data...</div>

  return (
    <div className="animate-fade-in pb-12 max-w-5xl mx-auto">
      <SectionHeading title="Edit Event" align="left" />
      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-8">
        {/* Basic Info */}
        <div>
          <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">Basic Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Event Title *</label>
              <input type="text" name="title" required className="input-field" value={formData.title} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea name="description" required rows={6} className="input-field" value={formData.description} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select name="category" required className="input-field" value={formData.category} onChange={handleChange}>
                {['music','tech','sports','art','food','business','education','health','fashion','comedy','other'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cover Image (Leave empty to keep current)</label>
              <input type="file" accept="image/*" className="input-field py-2" onChange={handleImageChange} />
            </div>
          </div>
        </div>

        {/* Date & Location */}
        <div>
          <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">Date & Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <input type="date" name="date" required className="input-field" value={formData.date} onChange={handleChange} />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-2">Start Time *</label>
                <input type="time" name="time" required className="input-field" value={formData.time} onChange={handleChange} />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-2">End Time</label>
                <input type="time" name="end_time" className="input-field" value={formData.end_time} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">City / Area (Location) *</label>
              <input type="text" name="location" required className="input-field" value={formData.location} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Specific Venue</label>
              <input type="text" name="venue" className="input-field" value={formData.venue} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Tickets & Status */}
        <div>
          <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">Tickets & Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Max Seats *</label>
              <input type="number" name="max_seats" required min={1} className="input-field" value={formData.max_seats} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ticket Type</label>
              <select name="is_free" className="input-field" value={formData.is_free ? 'true' : 'false'} onChange={(e) => {
                const isFree = e.target.value === 'true';
                setFormData((prev: any) => ({ ...prev, is_free: isFree, price: isFree ? 0 : prev.price }));
              }}>
                <option value="true">Free</option>
                <option value="false">Paid</option>
              </select>
            </div>
            {!formData.is_free && (
              <div>
                <label className="block text-sm font-medium mb-2">Ticket Price (₹) *</label>
                <input type="number" name="price" min={0.01} step="0.01" required className="input-field" value={formData.price} onChange={handleChange} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select name="status" className="input-field" value={formData.status} onChange={handleChange}>
                <option value="draft">Draft (Hidden)</option>
                <option value="published">Published (Live)</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <button type="button" onClick={() => navigate('/organizer')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
            <Save size={20} /> {isLoading ? 'Saving...' : 'Update Event'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditEvent
