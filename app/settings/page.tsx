'use client'

import { useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  const { user, supabase } = useAuth()
  const [name, setName] = useState(user?.user_metadata.full_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const updates = {
      email,
      phone,
      user_metadata: { full_name: name }
    }
    const { error } = await supabase.auth.updateUser(updates)
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Profile updated successfully')
    }

    if (avatar) {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${user?.id}/avatar.png`, avatar)
      if (uploadError) {
        setMessage(uploadError.message)
      } else {
        setMessage('Profile and avatar updated successfully')
      }
    }
  }

  if (!user) return <div>Please log in to view this page.</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">User Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="avatar">Avatar</Label>
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
          />
        </div>
        <Button type="submit">Update Profile</Button>
      </form>
      {message && <p className="mt-4 text-sm text-green-500">{message}</p>}
    </div>
  )
}
