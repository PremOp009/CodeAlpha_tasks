import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { eventService } from '../services/eventService'
import { aiService } from '../services/eventService'
import SectionHeading from '../components/SectionHeading'
import toast from 'react-hot-toast'
import { Wand2, Save } from 'lucide-react'

const CreateEvent = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isAILoading, setIsAILoading] = useState(false)
  const [aiIdea, setAiIdea] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    title: '', tagline: '', description: '', category: 'other',
    date: '', time: '', end_time: '', location: '', venue: '',
    max_seats: 100, price: 0, is_free: true, status: 'draft',
    highlights: [] as string[], seo_summary: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData((prev: any) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleAIGenerate = async () => {
    if (!aiIdea.trim()) {
      toast.error('Please enter an event idea first')
      return
    }
    setIsAILoading(true)
    try {
      const { data } = await aiService.generateDescription(aiIdea)
      setFormData((prev: any) => ({
        ...prev,
        description: data.description || prev.description,
        tagline: data.tagline || prev.tagline,
        highlights: data.highlights || prev.highlights,
        seo_summary: data.seo_summary || prev.seo_summary
      }))
      toast.success('AI generation complete!')
    } catch {
      toast.error('AI generation failed. Please try again.')
    } finally {
      setIsAILoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'image') return; // Absolutely prevent stringified image
        if (value === '') return; // Skip empty strings to prevent 400 Bad Request on optional fields like end_time
        if (key === 'highlights') {
          submitData.append(key, JSON.stringify(value))
        } else {
          submitData.append(key, String(value))
        }
      })
      if (imageFile) {
        console.log('Uploading file:', imageFile.name, imageFile.type, imageFile.size)
        // Convert to a raw Blob to guarantee FormData treats it as a file, avoiding any browser proxy/File object quirks
        const arrayBuffer = await imageFile.arrayBuffer()
        const safeBlob = new Blob([arrayBuffer], { type: imageFile.type })
        submitData.append('image', safeBlob, imageFile.name)
      }

      console.log('FormData keys:', Array.from(submitData.keys()))

      const { data } = await eventService.create(submitData)
      toast.success('Event created successfully!')
      navigate(`/events/${data.event.id}`)
    } catch (error: any) {
      const data = error.response?.data
      if (data) {
        if (data.error) toast.error(data.error)
        else {
          // DRF validation errors: {"field": ["Error message"]}
          const firstError = Object.values(data)[0]
          if (Array.isArray(firstError)) toast.error(firstError[0] as string)
          else toast.error('Validation Error. Please check your inputs.')
          
          const errorStr = JSON.stringify(data, null, 2)
          console.error("Backend validation failed:", errorStr)
          alert(`BACKEND ERROR:\n${errorStr}\n\nPlease copy this exact message and send it to me!`)
        }
      } else {
        toast.error('Failed to create event')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-fade-in pb-12 max-w-5xl mx-auto">
      <SectionHeading title="Create New Event" align="left" />

      {/* AI Assistant Box */}
      <div className="glass-card p-6 mb-8 border-primary-400/30 bg-primary-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-3xl rounded-full mix-blend-screen pointer-events-none" />
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Wand2 className="text-primary-100" /> AI Event Generator
        </h3>
        <p className="text-gray-300 text-sm mb-4">
          Describe your event idea shortly, and our AI will generate a professional description, tagline, highlights, and SEO summary for you.
        </p>
        <div className="flex flex-col md:flex-row gap-4 relative z-10">
          <input 
            type="text" 
            placeholder="e.g. A 2-day React & TypeScript masterclass for intermediate developers..." 
            className="input-field flex-grow"
            value={aiIdea}
            onChange={(e: any) => setAiIdea(e.target.value)}
          />
          <button 
            type="button"
            onClick={handleAIGenerate}
            disabled={isAILoading}
            className="btn-primary whitespace-nowrap"
          >
            {isAILoading ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
      </div>

      {/* Main Form */}
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
              <label className="block text-sm font-medium mb-2">Tagline (generated by AI)</label>
              <input type="text" name="tagline" className="input-field" value={formData.tagline} onChange={handleChange} />
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
              <label className="block text-sm font-medium mb-2">Cover Image</label>
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
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <button type="button" onClick={() => navigate('/organizer')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
            <Save size={20} /> {isLoading ? 'Saving...' : 'Create Event'}
          </button>
        </div>

      </form>
    </div>
  )
}

export default CreateEvent
