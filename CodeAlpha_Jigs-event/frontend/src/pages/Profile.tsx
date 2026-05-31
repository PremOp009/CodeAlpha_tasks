import React, { useState, useEffect } from 'react'
import { userService } from '../services/userService'
import { useAuth } from '../context/AuthContext'
import SectionHeading from '../components/SectionHeading'
import toast from 'react-hot-toast'
import { Camera, Save, Lock } from 'lucide-react'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '', bio: '', phone: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  const [passData, setPassData] = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [isPassLoading, setIsPassLoading] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await userService.getProfile()
        setProfileData({
          name: data.name || '',
          bio: data.bio || '',
          phone: data.phone || ''
        })
        setPreviewImage(data.profile_image_url || null)
      } catch {
        toast.error('Failed to load profile')
      }
    }
    fetchProfile()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', profileData.name)
      if (profileData.bio) formData.append('bio', profileData.bio)
      if (profileData.phone) formData.append('phone', profileData.phone)
      if (imageFile) formData.append('profile_image', imageFile)

      const { data } = await userService.updateProfile(formData)
      updateUser({ name: data.user.name, profile_image: data.user.profile_image_url })
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passData.new_password !== passData.confirm_password) {
      toast.error('New passwords do not match')
      return
    }
    setIsPassLoading(true)
    try {
      await userService.changePassword(passData)
      toast.success('Password changed successfully')
      setPassData({ old_password: '', new_password: '', confirm_password: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to change password')
    } finally {
      setIsPassLoading(false)
    }
  }

  return (
    <div className="animate-fade-in pb-12 max-w-4xl mx-auto">
      <SectionHeading title="Account Settings" align="left" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Update */}
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <img 
                  src={previewImage || `https://ui-avatars.com/api/?name=${profileData.name}&background=FFB9B9&color=fff`} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white/10"
                />
                <label className="absolute bottom-0 right-0 p-2 bg-primary-500 rounded-full cursor-pointer hover:bg-primary-600 transition-colors text-white">
                  <Camera size={16} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              <div>
                <p className="text-sm text-gray-400">Account Type</p>
                <p className="font-bold uppercase tracking-wider text-primary-100">{user?.role}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Full Name</label>
              <input type="text" className="input-field" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Phone Number</label>
              <input type="text" className="input-field" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Bio</label>
              <textarea className="input-field min-h-[100px] resize-y" value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
              <Save size={18} /> {isLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Password Update */}
        <div className="glass-card p-8 h-fit">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Lock size={24} /> Security</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Current Password</label>
              <input type="password" required minLength={8} className="input-field" value={passData.old_password} onChange={e => setPassData({...passData, old_password: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">New Password</label>
              <input type="password" required minLength={8} className="input-field" value={passData.new_password} onChange={e => setPassData({...passData, new_password: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Confirm New Password</label>
              <input type="password" required minLength={8} className="input-field" value={passData.confirm_password} onChange={e => setPassData({...passData, confirm_password: e.target.value})} />
            </div>
            <button type="submit" disabled={isPassLoading} className="btn-secondary flex items-center gap-2">
              <Save size={18} /> {isPassLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}

export default Profile
