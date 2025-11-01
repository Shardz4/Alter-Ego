'use client'
import { useState } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { buyYesPayload, buyNoPayload, waitForTransaction } from '@/lib/aptosClient'

interface TradeFormProps {
  marketAddress?: string
  marketId?: number
  isYes?: boolean
  agreementPercentage?: number
  onTradeComplete?: () => void
}

export default function TradeForm({
  marketAddress,
  marketId,
  isYes: propIsYes,
  agreementPercentage: propAgreementPercentage,
  onTradeComplete
}: TradeFormProps) {
  const { account, connected, signAndSubmitTransaction } = useWallet()
  const [amount, setAmount] = useState('')
  const [isYes, setIsYes] = useState(propIsYes !== undefined ? propIsYes : true)
  const [agreementPercentage, setAgreementPercentage] = useState(propAgreementPercentage || 50)
  const [slippage, setSlippage] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const ensureConnected = () => {
    if (!connected || !account) {
      alert('Please connect your Aptos wallet to trade')
      return false
    }
    return true
  }

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (marketId === undefined || !amount) {
      alert('Market ID and amount are required')
      return
    }
    if (!ensureConnected()) return

    setIsSubmitting(true)
    try {
      // Use the new SDK functions with perception data
      const amountNum = parseFloat(amount)
      const payload = isYes
        ? buyYesPayload(marketId, amountNum, agreementPercentage)
        : buyNoPayload(marketId, amountNum, agreementPercentage)

      const txnResult = await signAndSubmitTransaction({
        type: 'entry_function_payload',
        ...payload,
      } as any)

      const hashStr =
        typeof txnResult === 'string'
          ? txnResult
          : (txnResult as any)?.hash || (txnResult as any)?.transaction_hash

      if (hashStr) {
        try {
          await waitForTransaction(hashStr, 60_000)
          alert('✅ Trade successful! Your perception has been recorded.')
        } catch (err) {
          console.warn('Could not confirm txn within timeout', err)
          alert('⏳ Transaction submitted but confirmation timed out. Check your wallet.')
        }
      }

      onTradeComplete?.()
    } catch (err) {
      console.error('Trade failed:', err)
      alert('Trade failed. See console for details.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Only show "connect wallet" if truly not connected
  if (!connected || !account) {
    return (
      <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
        <p className="text-gray-500">Please connect your Aptos wallet to trade</p>
      </div>
    )
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Trade Prediction</h3>

      <form onSubmit={handleTrade} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prediction
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setIsYes(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isYes ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              YES
            </button>
            <button
              type="button"
              onClick={() => setIsYes(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !isYes ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              NO
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (uUSD)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            required
            min="0.01"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slippage Tolerance (%)
          </label>
          <input
            type="number"
            value={slippage}
            onChange={(e) => setSlippage(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            min="0.1"
            max="50"
            step="0.1"
          />
        </div>

        <div className="bg-neutral-900/10 p-4 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Current Price:</span>
            <span className="font-medium">--</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Estimated Shares:</span>
            <span className="font-medium">
              {amount ? (parseFloat(amount) / 1).toFixed(2) : '0'} {isYes ? 'YES' : 'NO'}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !amount}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-black font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all"
        >
          {isSubmitting ? 'Processing...' : `Buy ${isYes ? 'YES' : 'NO'}`}
        </button>
      </form>
    </div>
  )
}
