'use client'

import { useState } from 'react'
import AccountDropdown from '@/Components/AccountDropdown'
import MarketCard from '@/Components/MarketCard'
import { useEffect } from 'react'
import { useReadContract } from 'wagmi'
import CreateMarketForm from '@/Components/CreateMarketForm'
import TradeForm from '@/Components/TradeForm'

export default function Home() {
  const [activeTab, setActiveTab] = useState('markets')
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null)

  // Sample markets - shown until real data is available from the factory
  const sampleMarkets = [
    {
      id: '1',
      question: 'Will ETH hit $4k by end of 2025?',
      resolveTs: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days from now
      address: '0x1234567890123456789012345678901234567890'
    },
    {
      id: '2',
      question: 'Will BTC reach $120k by 2026?',
      resolveTs: Math.floor(Date.now() / 1000) + 86400 * 60,
      address: '0x2345678901234567890123456789012345678901'
    },
    {
      id: '3',
      question: 'Will the S&P 500 close above 7000 by year end?',
      resolveTs: Math.floor(Date.now() / 1000) + 86400 * 45,
      address: '0x3456789012345678901234567890123456789012'
    },
    {
      id: '4',
      question: 'Will the next CPI print be above 3%?',
      resolveTs: Math.floor(Date.now() / 1000) + 86400 * 14,
      address: '0x4567890123456789012345678901234567890123'
    },
    {
      id: '5',
      question: 'Will Ethereum Shanghai upgrade reach finality within 90 days?',
      resolveTs: Math.floor(Date.now() / 1000) + 86400 * 90,
      address: '0x5678901234567890123456789012345678901234'
    },
    {
      id: '6',
      question: 'Will the Fed raise rates at the next meeting?',
      resolveTs: Math.floor(Date.now() / 1000) + 86400 * 21,
      address: '0x6789012345678901234567890123456789012345'
    }
    ,
    {
      id: '7',
      question: 'Will Tesla report positive EPS next quarter?',
      resolveTs: Math.floor(Date.now() / 1000) + 86400 * 40,
      address: '0x7890123456789012345678901234567890123456'
    },
    {
      id: '8',
      question: 'Will the total value locked (TVL) of DeFi exceed $200B in 2025?',
      resolveTs: Math.floor(Date.now() / 1000) + 86400 * 120,
      address: '0x8901234567890123456789012345678901234567'
    },
    {
      id: '9',
      question: 'Will a Layer 2 reach >1k TPS on mainnet by next year?',
      resolveTs: Math.floor(Date.now() / 1000) + 86400 * 180,
      address: '0x9012345678901234567890123456789012345678'
    },
    {
      id: '10',
      question: 'Will the unemployment rate fall below 4% in the next 12 months?',
      resolveTs: Math.floor(Date.now() / 1000) + 86400 * 365,
      address: '0x0123456789012345678901234567890123456789'
    },
    {
      id: '11',
      question: 'Will a major stablecoin depeg by more than 2% in the next 6 months?',
      resolveTs: Math.floor(Date.now() / 1000) + 86400 * 180,
      address: '0x1123456789012345678901234567890123456789'
    },
    {
      id: '12',
      question: 'Will the next Ethereum hard fork be scheduled within 9 months?',
      resolveTs: Math.floor(Date.now() / 1000) + 86400 * 270,
      address: '0x2123456789012345678901234567890123456789'
    }
  ]

  // Read markets from on-chain MarketFactory if configured
  const FACTORY_ADDR = process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS as string | undefined

  const { data: factoryMarkets, refetch: refetchFactoryMarkets } = useReadContract({
    address: FACTORY_ADDR as `0x${string}`,
    abi: [
      {
        inputs: [],
        name: 'getMarkets',
        outputs: [{ name: '', type: 'address[]' }],
        stateMutability: 'view',
        type: 'function'
      }
    ],
    functionName: 'getMarkets',
    query: { enabled: !!FACTORY_ADDR }
  })

  useEffect(() => {
    // refetch when returning from create flow
  }, [factoryMarkets])

  const handleTrade = (marketAddress: string, isYes: boolean) => {
    setSelectedMarket(marketAddress)
    setActiveTab('trade')
  }

  const handleMarketCreated = (marketAddress: string) => {
    // Refresh markets list when a market is created
    refetchFactoryMarkets?.()
    setActiveTab('markets')
  }

  // Frontend should be configured with the deployed MarketFactory address.
  // Set NEXT_PUBLIC_MARKET_FACTORY_ADDRESS in apps/web/.env.local after deploying contracts.
  return (
  <div className="min-h-screen bg-black">
  {/* Header */}
  <header className="bg-black backdrop-blur-md shadow-lg border-b border-gray-700/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <a href="/" className="text-white font-bold">Home</a>
              {/* Push Chain link removed */}
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <img src="/alter.ico" alt="Alter Ego" className="w-10 h-10 rounded-md object-cover border border-amber-600/20" />
                <div>
                  <h1 className="text-2xl font-bold text-amber-400">
                    Alter Ego
                  </h1>
                  <span className="text-sm text-gray-400">A Universal Prediction Market</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live Markets</span>
              </div>
      <AccountDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
  <nav className="bg-black backdrop-blur-md border-b border-gray-700/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {[
          { id: 'markets', label: 'Markets', icon: '📊', color: 'bg-black' },
          { id: 'create', label: 'Create Market', icon: '➕', color: 'bg-black' },
          { id: 'trade', label: 'Trade', icon: '💰', color: 'bg-black' },
          { id: 'portfolio', label: 'Portfolio', icon: '👤', color: 'bg-black' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 px-6 font-medium text-sm transition-all duration-200 rounded-lg mx-1 ${
                  activeTab === tab.id
                    ? `${tab.color} text-amber-400 shadow-lg transform scale-105`
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'markets' && (
          <div className="animate-fade-in">
            <div className="mb-8 text-center">
              <h2 className="text-4xl font-bold text-amber-400 mb-4">
                Active Markets
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Predict the future and earn rewards for accurate predictions. 
                <span className="text-amber-400 font-semibold"> Join the prediction revolution!</span>
              </p>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {/* If factory is configured, display on-chain markets; otherwise fall back to sampleMarkets */}
              {factoryMarkets && factoryMarkets.length > 0 ? (
                factoryMarkets.map((addr: string, index: number) => (
                  <div key={addr} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                    <MarketCard
                      marketAddress={addr}
                      onTrade={handleTrade}
                    />
                  </div>
                ))
              ) : (
                sampleMarkets.map((market, index) => (
                  <div key={market.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <MarketCard
                      question={market.question}
                      resolveTs={market.resolveTs}
                      marketAddress={market.address}
                      onTrade={handleTrade}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="animate-fade-in">
            <div className="mb-8 text-center">
              <h2 className="text-4xl font-bold text-amber-400 mb-4">
                Create New Market
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Create prediction markets for any event you want to predict. 
                <span className="text-amber-400 font-semibold"> Be the first to predict the future!</span>
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <CreateMarketForm factoryAddress={FACTORY_ADDR} onMarketCreated={handleMarketCreated} />
            </div>
          </div>
        )}

        {activeTab === 'trade' && (
          <div className="animate-fade-in">
            <div className="mb-8 text-center">
              <h2 className="text-4xl font-bold text-amber-400 mb-4">
                Trade Predictions
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                {selectedMarket ? 'Trade on the selected market' : 'Select a market to trade'}
                <span className="text-amber-400 font-semibold"> Start trading now!</span>
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              {selectedMarket ? (
                <TradeForm 
                  marketAddress={selectedMarket}
                  onTradeComplete={() => setActiveTab('markets')}
                />
              ) : (
                <div className="text-center py-12 bg-neutral-900/20 rounded-2xl border-2 border-dashed border-orange-400/30">
                  <div className="text-6xl mb-4">💰</div>
                  <p className="text-gray-300 text-lg">Please select a market from the Markets tab to start trading</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="animate-fade-in">
            <div className="mb-8 text-center">
              <h2 className="text-4xl font-bold text-amber-400 mb-4">
                Your Portfolio
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Track your predictions and earnings. 
                <span className="text-amber-400 font-semibold"> Monitor your success!</span>
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-neutral-900/20 rounded-2xl shadow-lg p-8 border border-amber-600/10">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold text-amber-400 mb-2">Portfolio Analytics</h3>
                  <p className="text-gray-300 mb-6">Advanced portfolio tracking coming soon...</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-neutral-900/60 rounded-lg p-4 shadow-sm border border-amber-600/10">
                          <div className="text-2xl font-bold text-amber-400">$0.00</div>
                          <div className="text-sm text-gray-300">Total Earnings</div>
                        </div>
                        <div className="bg-neutral-900/60 rounded-lg p-4 shadow-sm border border-amber-600/10">
                          <div className="text-2xl font-bold text-amber-400">0</div>
                          <div className="text-sm text-gray-300">Active Positions</div>
                        </div>
                        <div className="bg-neutral-900/60 rounded-lg p-4 shadow-sm border border-amber-600/10">
                          <div className="text-2xl font-bold text-amber-400">0%</div>
                          <div className="text-sm text-gray-300">Win Rate</div>
                        </div>
                      </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </main>
    </div>
  )
}