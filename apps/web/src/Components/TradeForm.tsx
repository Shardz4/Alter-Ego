'use client'
import { useState } from 'react'
import { useWriteContract, useReadContract, useAccount } from 'wagmi'
import { parseEther, formatEther } from 'viem'

interface TradeFormProps {
  marketAddress?: string
  onTradeComplete?: () => void
}

export default function TradeForm({ marketAddress, onTradeComplete }: TradeFormProps) {
  const { address } = useAccount()
  const { writeContract, isPending } = useWriteContract()
  const [amount, setAmount] = useState('')
  const [isYes, setIsYes] = useState(true)
  const [slippage, setSlippage] = useState(1) // 1% default slippage

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

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!marketAddress || !amount || !address) return

    try {
      const amountWei = parseEther(amount)
      const minOut = isYes 
        ? amountWei * BigInt(100 - slippage) / 100n
        : amountWei * BigInt(100 - slippage) / 100n

      const functionName = isYes ? 'buyYes' : 'buyNo'
      
      await writeContract({
        address: marketAddress as `0x${string}`,
        abi: [
          {
            "inputs": [
              {"name": "uUsdIn", "type": "uint256"},
              {"name": "minYesOut", "type": "uint256"},
              {"name": "to", "type": "address"}
            ],
            "name": "buyYes",
            "outputs": [{"name": "yesOut", "type": "uint256"}],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {"name": "uUsdIn", "type": "uint256"},
              {"name": "minNoOut", "type": "uint256"},
              {"name": "to", "type": "address"}
            ],
            "name": "buyNo",
            "outputs": [{"name": "noOut", "type": "uint256"}],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: functionName as 'buyYes' | 'buyNo',
        args: [amountWei, minOut, address]
      })

      onTradeComplete?.()
    } catch (error) {
      console.error('Trade failed:', error)
    }
  }

  const isExpired = marketInfo?.[1] ? Date.now() / 1000 > Number(marketInfo[1]) : false
  const isSettled = marketInfo?.[2] || false
  const price = priceYes ? Number(formatEther(priceYes)) : 0.5

  if (!address) {
    return (
      <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
        <p className="text-gray-500">Please connect your wallet to trade</p>
      </div>
    )
  }

  if (isSettled || isExpired) {
    return (
      <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
        <p className="text-gray-500">
          {isSettled ? 'This market has been settled' : 'This market has expired'}
        </p>
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
            <span className="font-medium">
              {(price * 100).toFixed(1)}% YES
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Estimated Shares:</span>
            <span className="font-medium">
              {amount ? (parseFloat(amount) / price).toFixed(2) : '0'} {isYes ? 'YES' : 'NO'}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || !amount}
          className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Processing...' : `Buy ${isYes ? 'YES' : 'NO'}`}
        </button>
      </form>
    </div>
  )
}