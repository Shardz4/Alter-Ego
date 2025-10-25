'use client'

import { useEffect, useRef, useState } from 'react'
import { signOutFirebase, onAuthStateChanged, User } from '@/lib/firebase'
import { useAccount, useDisconnect } from 'wagmi'
import ConnectButton from './ConnectButton'
import Link from 'next/link'

export default function AccountDropdown() {
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // onAuthStateChanged is guarded; it will no-op on server and work in browser
    const unsub = onAuthStateChanged((u: User | null) => setUser(u))
    return () => unsub()
  }, [])

  // If the wallet is connected but the user is not signed in, disconnect the wallet
  const { isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    if (!user && isConnected) {
      // disconnect to avoid automatic persistent connection
      try {
        disconnect()
      } catch (err) {
        console.warn('Failed to disconnect wallet automatically', err)
      }
    }
  }, [user, isConnected, disconnect])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOutFirebase()
    } finally {
      // ensure wallet disconnect on sign out
      try {
        disconnect()
      } catch (err) {
        console.warn('Disconnect failed during sign out', err)
      }
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex items-center space-x-2 bg-neutral-900/60 p-2 rounded-lg hover:bg-neutral-800/80"
        aria-expanded={open}
      >
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-amber-400 font-bold border border-amber-600/20">
          {user ? user.displayName?.charAt(0).toUpperCase() ?? user.email?.charAt(0).toUpperCase() : 'G'}
        </div>
        <div className="hidden sm:block text-sm text-gray-200">
          {user ? user.displayName ?? user.email : 'Guest'}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-gray-900/90 border border-gray-700 rounded-lg shadow-lg p-4 z-50">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                  {user.photoURL && <img src={user.photoURL} alt="avatar" />}
                </div>
                <div>
                  <div className="font-semibold text-white">{user.displayName ?? user.email}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </div>
              </div>

              <div>
                <ConnectButton />
              </div>

              <div className="flex space-x-2">
                <button onClick={handleSignOut} className="flex-1 bg-red-600 py-2 rounded-lg text-white">
                  Sign out
                </button>
                <Link href="/profile" className="flex-1 bg-gray-800 py-2 rounded-lg text-gray-200 text-center">
                  Profile
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-300">You are not signed in.</div>
              <div className="flex space-x-2">
                <Link href="/login" className="flex-1 bg-black py-2 rounded-lg text-amber-400 text-center border border-amber-600/20">Sign in</Link>
                <button onClick={() => setOpen(false)} className="flex-1 bg-gray-800 py-2 rounded-lg text-gray-200">Close</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
