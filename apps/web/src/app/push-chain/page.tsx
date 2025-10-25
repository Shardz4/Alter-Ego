'use client'

import { useState } from 'react'
import AccountDropdown from '@/Components/AccountDropdown'

export default function PushChainPage() {
  return (
  <div className="min-h-screen bg-black">
  {/* Header */}
  <header className="bg-black backdrop-blur-md shadow-lg border-b border-gray-700/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-amber-400 font-bold text-xl">Alter Ego Integration</h1>
            </div>
            <div>
              <AccountDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content (removed) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-gray-800/60 p-12 rounded-2xl border border-gray-700/20">
          <h2 className="text-3xl font-bold text-white mb-4">Alter Ego demo removed</h2>
          <p className="text-gray-300 mb-6">The demo and tutorial components were removed from the public UI. If you need this content restored, we can add a private demo or docs page.</p>
          <a href="/" className="inline-block bg-amber-600 hover:bg-amber-700 text-black py-2 px-4 rounded-lg">Return Home</a>
        </div>
      </main>
    </div>
  )
}