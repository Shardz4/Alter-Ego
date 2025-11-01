'use client'

import React, { useState } from 'react'
import AccountDropdown from '@/Components/AccountDropdown'
import MarketCard from '@/Components/MarketCard'
import TradeForm from '@/Components/TradeForm'

export default function HomePage() {
  // Pre-populated markets with engaging questions
  const initialMarkets = [
    {
      id: 0,
      address: 'market_0',
      question: 'Will Donald Trump\'s economic policies lead to GDP growth above 3% in 2025?',
      resolveTs: Math.floor(Date.now() / 1000) + 86400 * 365, // 1 year
    },
    {
      id: 1,
      address: 'market_1',
      question: 'Will AI replace more than 30% of software engineering jobs by 2030?',
      resolveTs: Math.floor(Date.now() / 1000) + 86400 * 180, // 6 months
    },
    {
      id: 2,
      address: 'market_2',
      question: 'Will Bitcoin reach $150,000 before the end of 2025?',
      resolveTs: Math.floor(Date.now() / 1000) + 86400 * 400, // ~13 months
    },
    {
      id: 3,
      address: 'market_3',
      question: 'Will SpaceX successfully land humans on Mars by 2030?',
      resolveTs: Math.floor(Date.now() / 1000) + 86400 * 1825, // 5 years
    },
    {
      id: 4,
      address: 'market_4',
      question: 'Will remote work become the standard for tech companies by 2026?',
      resolveTs: Math.floor(Date.now() / 1000) + 86400 * 730, // 2 years
    },
    {
      id: 5,
      address: 'market_5',
      question: 'Will a major tech company launch a successful metaverse platform in 2025?',
      resolveTs: Math.floor(Date.now() / 1000) + 86400 * 365, // 1 year
    },
    {
      id: 6,
      address: 'market_6',
      question: 'Will electric vehicles outsell gas vehicles globally by 2028?',
      resolveTs: Math.floor(Date.now() / 1000) + 86400 * 1095, // 3 years
    },
    {
      id: 7,
      address: 'market_7',
      question: 'Will quantum computing solve a major real-world problem by 2027?',
      resolveTs: Math.floor(Date.now() / 1000) + 86400 * 1095, // 3 years
    },
  ]

  const [markets] = useState<any[]>(initialMarkets)
  const [selectedMarket, setSelectedMarket] = useState<{id: number, isYes: boolean, agreementPercentage: number} | null>(null)

  const handleTradeComplete = () => {
    alert('Trade complete!')
    setSelectedMarket(null)
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-amber-400">SenzTrade</h1>
              <p className="text-xs text-gray-400 italic">A PERCEPTION Market</p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button className="bg-amber-600 hover:bg-amber-700 text-black px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2">
                <span>📊</span> Markets
              </button>
              <button className="bg-neutral-800 hover:bg-neutral-700 text-amber-400 px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2">
                <span>➕</span> Create Market
              </button>
              <button className="bg-neutral-800 hover:bg-neutral-700 text-amber-400 px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2">
                <span>💼</span> Trade
              </button>
              <button className="bg-neutral-800 hover:bg-neutral-700 text-amber-400 px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2">
                <span>👤</span> Portfolio
              </button>
            </div>

            {/* Right Side - Live Markets & Account */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-300">Live Markets</span>
              </div>
              <AccountDropdown />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Active Markets Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-3">Active Markets</h2>
          <p className="text-gray-400">
            Predict the future and earn rewards for accurate predictions.{' '}
            <span className="text-amber-400 font-semibold">Join the prediction revolution!</span>
          </p>
        </div>

        {/* Market Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((m, idx) => (
            <MarketCard
              key={idx}
              question={m.question}
              resolveTs={m.resolveTs}
              marketAddress={m.address}
              marketId={m.id}
              onTrade={(marketId, isYes, agreementPercentage) =>
                setSelectedMarket({ id: marketId, isYes, agreementPercentage })
              }
            />
          ))}
        </div>
      </div>

      {/* Trade Modal - Now handled by MarketCard modal */}
      {selectedMarket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border-2 border-amber-600/30 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-amber-400 mb-6">Confirm Trade</h2>
            <div className="text-white space-y-4">
              <p><strong>Market ID:</strong> {selectedMarket.id}</p>
              <p><strong>Prediction:</strong> {selectedMarket.isYes ? '✅ YES' : '❌ NO'}</p>
              <p><strong>Agreement Percentage:</strong> {selectedMarket.agreementPercentage}%</p>
              <TradeForm
                marketAddress={markets[selectedMarket.id]?.address || ''}
                marketId={selectedMarket.id}
                isYes={selectedMarket.isYes}
                agreementPercentage={selectedMarket.agreementPercentage}
                onTradeComplete={handleTradeComplete}
              />
            </div>
            <button
              className="mt-6 w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-xl transition-all font-bold"
              onClick={() => setSelectedMarket(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
