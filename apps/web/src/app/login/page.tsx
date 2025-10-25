'use client'

import React, { useEffect, useState } from 'react'
import { signInWithGoogle, signOutFirebase, onAuthStateChanged, type User } from '@/lib/firebase'

export default function LoginPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // guarded; will no-op on server and attach listener in browser
    const unsub = onAuthStateChanged((u: User | null) => {
      setUser(u)
    })
    return () => unsub()
  }, [])

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (err) {
      console.error('Google sign-in failed', err)
      alert('Google sign-in failed. Check console for details.')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOutFirebase()
    } catch (err) {
      console.error('Sign out failed', err)
    }
  }

  return (
  <div className="min-h-screen flex items-center justify-center p-6 bg-black text-white">
      <div className="w-full max-w-md bg-white/5 backdrop-blur rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl font-semibold mb-4">Sign in with Google</h1>
        <p className="text-sm text-gray-300 mb-6">Use your Google account to sign in to the app.</p>

        {user ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                {user.photoURL && <img src={user.photoURL} alt="avatar" />}
              </div>
              <div>
                <div className="font-medium">{user.displayName ?? user.email}</div>
                <div className="text-sm text-gray-300">{user.email}</div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSignOut}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleSignIn}
              className="w-full flex items-center justify-center space-x-3 bg-white text-slate-900 py-2 px-4 rounded-lg shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#fbbc05" d="M43.6 20.5H42V20H24v8h11.3C34.7 32 30 36 24 36c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.4 0 6.5 1.3 8.8 3.5l6.1-6.1C35.1 4.9 29.9 2 24 2 12.9 2 4 10.9 4 22s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.5z"/>
                <path fill="#518ef8" d="M6.3 14.5l7.1 5.2C15.4 16 19.5 14 24 14c3.4 0 6.5 1.3 8.8 3.5l6.1-6.1C35.1 4.9 29.9 2 24 2 17.7 2 12 4.8 9.7 9.7l-3.4 4.8z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>

            <div className="text-xs text-gray-400">
              You will be redirected to Google's sign-in popup. Ensure popups are allowed in your browser.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
