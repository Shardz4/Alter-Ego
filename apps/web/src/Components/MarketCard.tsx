'use client'
import { useEffect, useState } from 'react'
import { getMarket, getMarketPrice } from '@/lib/aptosClient'

interface Props {
  question?: string
  resolveTs?: number
  marketAddress?: string
  marketId?: number
  onTrade?: (marketId: number, isYes: boolean, agreementPercentage: number) => void
}

export default function MarketCard({ question, resolveTs, marketAddress, marketId, onTrade }: Props) {
  const [onchainQuestion, setOnchainQuestion] = useState<string | undefined>(undefined)
  const [onchainResolveTs, setOnchainResolveTs] = useState<number | undefined>(undefined)
  const [isSettled, setIsSettled] = useState(false)
  const [totalYes, setTotalYes] = useState('0')
  const [totalNo, setTotalNo] = useState('0')
  const [price, setPrice] = useState(0.5)
  const [showModal, setShowModal] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<'yes' | 'no' | null>(null)
  const [agreementPercentage, setAgreementPercentage] = useState<number>(50)

  useEffect(() => {
    const fetchData = async () => {
      if (marketId === undefined) return

      try {
        // Fetch market data from Aptos using new SDK
        const market = await getMarket(marketId)
        if (market) {
          setOnchainQuestion(market.question)
          setOnchainResolveTs(market.resolveTs)
          setIsSettled(market.settled)
          setTotalYes(market.totalYesShares.toString())
          setTotalNo(market.totalNoShares.toString())
        }

        // Fetch current price
        const currentPrice = await getMarketPrice(marketId)
        setPrice(currentPrice)
      } catch (e) {
        console.warn('Failed to fetch market data:', e)
      }
    }

    fetchData()

    // Refresh data every 10 seconds
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [marketId])

  const displayedQuestion = question || onchainQuestion || 'Loading question...'
  const displayedResolveTs = resolveTs || onchainResolveTs || Math.floor(Date.now() / 1000) + 3600

  const isExpired = Date.now() / 1000 > displayedResolveTs
  const statusText = isSettled ? 'Settled' : isExpired ? 'Expired' : 'Active'

  return (
    <div className="bg-neutral-900 border border-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-amber-600/50">
      {/* Question and Status Badge */}
      <div className="mb-4">
        <div className="flex justify-end mb-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${isSettled ? 'bg-green-600 text-white' : isExpired ? 'bg-red-600 text-white' : 'bg-amber-600 text-black'}`}>
            {statusText}
          </span>
        </div>
        <h3 className="text-lg font-bold text-white leading-tight mb-4">
          {displayedQuestion}
        </h3>
      </div>

      {/* Market Info */}
      <div className="space-y-3 mb-4">
        <div className="bg-black/40 rounded-lg p-3 border border-gray-800">
          <p className="text-xs text-gray-400 mb-1">Resolves:</p>
          <p className="text-sm font-semibold text-white">
            {new Date(displayedResolveTs * 1000).toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </div>
        <div className="bg-black/40 rounded-lg p-3 border border-gray-800">
          <p className="text-xs text-gray-400 mb-1">Current Price:</p>
          <p className="text-sm font-bold text-green-400">{(price * 100).toFixed(1)}% YES</p>
        </div>
      </div>

      {!isSettled && !isExpired && (
        <div className="space-y-3">
          {/* YES/NO Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSelectedAnswer('yes')
                setShowModal(true)
              }}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-black py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
            >
              <span>✅</span> YES
            </button>
            <button
              onClick={() => {
                setSelectedAnswer('no')
                setShowModal(true)
              }}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-black py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
            >
              <span>❌</span> NO
            </button>
          </div>

          {/* Start Trading Button */}
          <button
            onClick={() => {
              setSelectedAnswer('yes')
              setShowModal(true)
            }}
            className="w-full bg-amber-600 hover:bg-amber-700 text-black py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
          >
            <span>💰</span> Start Trading
          </button>
        </div>
      )}

      {/* Total YES/NO */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Total YES: {totalYes}</span>
          <span>Total NO: {totalNo}</span>
        </div>
      </div>

      {/* Modal for percentage question */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border-2 border-amber-600/30 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-amber-400 mb-4">
              You selected: {selectedAnswer === 'yes' ? '✅ YES' : '❌ NO'}
            </h3>

            <div className="mb-6">
              <p className="text-white text-lg mb-4">
                How much percentage of people do you think will agree with you?
              </p>

              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={agreementPercentage}
                  onChange={(e) => setAgreementPercentage(Number(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="text-center">
                  <span className="text-4xl font-bold text-amber-400">{agreementPercentage}%</span>
                  <p className="text-gray-400 text-sm mt-2">of people will agree</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  if (marketId !== undefined) {
                    onTrade?.(marketId, selectedAnswer === 'yes', agreementPercentage)
                  }
                }}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-black py-3 px-6 rounded-xl transition-all duration-200 shadow-lg font-bold"
              >
                💰 Confirm Trade
              </button>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedAnswer(null)
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl transition-all duration-200 font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
