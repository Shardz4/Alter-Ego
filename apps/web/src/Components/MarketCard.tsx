'use client'
import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'

interface Props { 
  question?: string
  resolveTs?: number
  marketAddress?: string
  onTrade?: (marketAddress: string, isYes: boolean) => void
}

export default function MarketCard({ question, resolveTs, marketAddress, onTrade }: Props) {
  const [showTradeForm, setShowTradeForm] = useState(false)
  const [tradeAmount, setTradeAmount] = useState('')
  const [isYes, setIsYes] = useState(true)
  
  const { data: marketInfo } = useReadContract({
    address: marketAddress as `0x${string}`,
    abi: [
      {
        "inputs": [],
        "name": "getMarketInfo",
        "outputs": [
          {"name": "_question", "type": "string"},
          {"name": "_resolveTs", "type": "uint64"},
          {"name": "_settled", "type": "bool"},
          {"name": "_result", "type": "bytes32"},
          {"name": "_totalYes", "type": "uint256"},
          {"name": "_totalNo", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'getMarketInfo',
    query: { enabled: !!marketAddress }
  })

  const { data: priceYes } = useReadContract({
    address: marketAddress as `0x${string}`,
    abi: [
      {
        "inputs": [],
        "name": "getPriceYes",
        "outputs": [{"name": "priceRay", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'getPriceYes',
    query: { enabled: !!marketAddress }
  })

  // Prefer props if provided, otherwise fall back to on-chain marketInfo
  const onchainQuestion: string | undefined = marketInfo?.[0]
  const onchainResolveTs: number | undefined = marketInfo ? Number(marketInfo[1]) : undefined
  const displayedQuestion = question || onchainQuestion || 'Loading question...'
  const displayedResolveTs = resolveTs || onchainResolveTs || Math.floor(Date.now() / 1000) + 3600

  const isExpired = Date.now() / 1000 > displayedResolveTs
  const isSettled = marketInfo?.[2] || false
  const totalYes = marketInfo?.[4] || BigInt(0)
  const totalNo = marketInfo?.[5] || BigInt(0)
  const price = priceYes ? Number(formatEther(priceYes)) : 0.5
  
  const getStatusColor = () => {
    if (isSettled) return 'bg-green-900/30 border-green-500/30'
    if (isExpired) return 'bg-red-900/30 border-red-500/30'
    return 'bg-neutral-900/30 border-amber-600/20'
  }

  const getStatusText = () => {
    if (isSettled) return 'Settled'
    if (isExpired) return 'Expired'
    return 'Active'
  }

  return (
    <div className={`border-2 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 backdrop-blur-sm ${getStatusColor()}`}>
      <div className="flex justify-between items-start mb-4">
  <h2 className="text-xl font-bold text-amber-400 flex-1 leading-tight">{displayedQuestion}</h2>
        <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
          isSettled ? 'bg-green-500 text-white' : 
          isExpired ? 'bg-red-500 text-white' : 
          'bg-amber-600 text-black animate-pulse-slow'
        }`}>
          {getStatusText()}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/60 rounded-lg p-3 backdrop-blur-sm border border-gray-700/50">
          <p className="text-sm text-gray-300 font-medium">Resolves:</p>
          <p className="font-bold text-white">{new Date(displayedResolveTs * 1000).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          })}</p>
        </div>
        <div className="bg-gray-800/60 rounded-lg p-3 backdrop-blur-sm border border-gray-700/50">
          <p className="text-sm text-gray-300 font-medium">Current Price:</p>
          <p className="font-bold text-green-400">{(price * 100).toFixed(1)}% YES</p>
        </div>
      </div>

      {!isSettled && !isExpired && (
        <div className="space-y-3">
          <div className="flex space-x-3">
            <button
              onClick={() => setIsYes(true)}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg ${
                isYes ? 'bg-green-500 text-white transform scale-105 shadow-green-200' : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
              }`}
            >
              ✅ YES
            </button>
            <button
              onClick={() => setIsYes(false)}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg ${
                !isYes ? 'bg-red-500 text-white transform scale-105 shadow-red-200' : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
              }`}
            >
              ❌ NO
            </button>
          </div>

          {showTradeForm ? (
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Amount (uUSD)"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                className="w-full p-4 border-2 border-amber-400/30 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 bg-gray-800/80 backdrop-blur-sm text-white placeholder-gray-400"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => onTrade?.(marketAddress!, isYes)}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-black py-3 px-6 rounded-xl transition-all duration-200 shadow-lg font-bold"
                >
                  🚀 Trade {isYes ? 'YES' : 'NO'}
                </button>
                <button
                  onClick={() => setShowTradeForm(false)}
                  className="px-6 py-3 border-2 border-gray-600 rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowTradeForm(true)}
              className="w-full bg-amber-600 hover:bg-amber-700 text-black py-3 px-6 rounded-xl transition-all duration-200 shadow-lg font-bold"
            >
              💰 Start Trading
            </button>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="flex justify-between text-sm text-gray-300">
          <span>Total YES: {formatEther(totalYes)}</span>
          <span>Total NO: {formatEther(totalNo)}</span>
        </div>
      </div>
    </div>
  )
}