'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'

export function Auth() {
  const { user, supabase } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMessage(error.message)
    else setMessage('Check your email for the confirmation link!')
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
  }

  const handleSignInWithMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) setMessage(error.message)
    else setMessage('Check your email for the magic link!')
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) setMessage(error.message)
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) setMessage(error.message)
    else setMessage('Check your email for the password reset link!')
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.updateUser({ email, password })
    if (error) setMessage(error.message)
    else setMessage('User information updated successfully!')
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    // Note: This requires the service_role_key and should only be used server-side
    const { error } = await supabase.auth.admin.inviteUserByEmail(email)
    if (error) setMessage(error.message)
    else setMessage('Invitation sent successfully!')
  }

  if (user) {
    return (
      <div>
        <p>Logged in as: {user.email}</p>
        <button onClick={handleSignOut}>Sign Out</button>
        <form onSubmit={handleUpdateUser}>
          <input
            type="email"
            placeholder="New Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Update User</button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign Up</button>
      </form>
      <form onSubmit={handleSignIn}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign In</button>
      </form>
      <form onSubmit={handleSignInWithMagicLink}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Sign In with Magic Link</button>
      </form>
      <form onSubmit={handlePasswordReset}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Reset Password</button>
      </form>
      <form onSubmit={handleInviteUser}>
        <input
          type="email"
          placeholder="Email to invite"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Invite User</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}
