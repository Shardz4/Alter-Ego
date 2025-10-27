'use client'
import { useState } from 'react'
import { useWriteContract, useAccount, useSwitchChain, usePublicClient, useWalletClient } from 'wagmi'
import { pushDonutTestnet as pushChain, deploymentChain } from '@/config/chains'

interface CreateMarketFormProps {
  factoryAddress?: string
  onMarketCreated?: (marketAddress: string) => void
}

export default function CreateMarketForm({ factoryAddress, onMarketCreated }: CreateMarketFormProps) {
  const { address, chain, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { writeContractAsync, isPending } = useWriteContract()
  const { switchChain } = useSwitchChain()
  const publicClient = usePublicClient()
  const [question, setQuestion] = useState('')
  const [resolveDate, setResolveDate] = useState('')
  const [resolveTime, setResolveTime] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [deployToPushChain, setDeployToPushChain] = useState(false)
  const [isNetworkSwitching, setIsNetworkSwitching] = useState(false)
  
  // Push Chain factory address - would typically come from environment variables
  const PUSH_CHAIN_FACTORY_ADDRESS = "0x1234567890123456789012345678901234567890" // Replace with actual address

  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!question || !resolveDate || !resolveTime) return

    // Robust connection guard
    if (!address) {
      alert('Please connect your wallet to create markets')
      return
    }

    if (!walletClient) {
      alert('Wallet client not available. Please reconnect your wallet.')
      return
    }

    try {
      const resolveDateTime = new Date(`${resolveDate}T${resolveTime}`)
      const resolveTs = Math.floor(resolveDateTime.getTime() / 1000)
      
      if (resolveTs <= Date.now() / 1000) {
        alert('Resolution time must be in the future')
        return
      }

      // Switch to the appropriate network based on deployment choice
      if (deployToPushChain && chain?.id !== pushChain.id) {
        setIsNetworkSwitching(true)
        try {
          await switchChain({ chainId: pushChain.id })
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          console.error('Failed to switch to Push Chain:', error)
          alert('Failed to switch to Push Chain. Please try switching manually.')
          setIsNetworkSwitching(false)
          return
        }
        setIsNetworkSwitching(false)
      } else if (!deployToPushChain && chain?.id !== deploymentChain.id) {
        setIsNetworkSwitching(true)
        try {
          await switchChain({ chainId: deploymentChain.id })
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          console.error(`Failed to switch to ${deploymentChain.name}:`, error)
          alert(`Failed to switch to ${deploymentChain.name}. Please try switching manually.`)
          setIsNetworkSwitching(false)
          return
        }
        setIsNetworkSwitching(false)
      }

      const envFactory = (process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS as string) || undefined
      const envPushFactory = (process.env.NEXT_PUBLIC_PUSH_CHAIN_FACTORY_ADDRESS as string) || undefined

      const targetAddress = deployToPushChain
        ? (envPushFactory || PUSH_CHAIN_FACTORY_ADDRESS)
        : (factoryAddress ?? envFactory) as `0x${string}` | undefined

      if (!targetAddress) {
        alert('MarketFactory address is not configured. Set NEXT_PUBLIC_MARKET_FACTORY_ADDRESS in your frontend .env.local or pass factoryAddress prop.')
        return
      }

      const marketAbi = [
        {
          inputs: [
            { name: 'question', type: 'string' },
            { name: 'resolveTs', type: 'uint64' },
          ],
          name: 'createMarket',
          outputs: [{ name: 'market', type: 'address' }],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ]

      const hash = await writeContractAsync({
        address: targetAddress as `0x${string}`,
        abi: marketAbi,
        functionName: 'createMarket',
        args: [question, BigInt(resolveTs)],
      })

      if (hash && publicClient) {
        try {
          await publicClient.waitForTransactionReceipt({ hash })
        } catch (err) {
          console.warn('Could not wait for tx confirmation:', err)
        }
      }

      setQuestion('')
      setResolveDate('')
      setResolveTime('')
      setShowForm(false)
      onMarketCreated?.('')
    } catch (error) {
      console.error('Market creation failed:', error)
    }
  }

  // Only show "connect wallet" if truly not connected
  if (!isConnected || !address) {
    return (
      <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
        <p className="text-gray-500">Please connect your wallet to create markets</p>
      </div>
    )
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-lg">
      {!showForm ? (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Create New Market</h3>
          <p className="text-gray-600 mb-4">
            Create a prediction market for any event you want to predict
          </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-amber-600 text-white py-2 px-6 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Create Market
            </button>
        </div>
      ) : (
        <form onSubmit={handleCreateMarket} className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Create New Market</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Market Question *
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., Will Bitcoin reach $100,000 by end of 2024?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              required
              rows={3}
            />
            <p className="text-sm text-gray-500 mt-1">
              Be specific and clear about what you're predicting
            </p>
          </div>
          
          <div className="flex items-center">
            <input
              id="deployToPushChain"
              type="checkbox"
              checked={deployToPushChain}
              onChange={(e) => setDeployToPushChain(e.target.checked)}
              className="h-4 w-4 accent-amber-400 focus:ring-amber-400 border-gray-300 rounded"
            />
            <label htmlFor="deployToPushChain" className="ml-2 block text-sm text-gray-700">
              Deploy to Push Chain (Cross-chain market)
            </label>
          </div>
          
          {deployToPushChain ? (
            <div className="bg-neutral-900/10 p-3 rounded-lg mt-2 text-sm">
              <p>Your market will be deployed on Push Chain, enabling cross-chain trading and liquidity.</p>
              {chain?.id !== pushChain.id && (
                <p className="text-orange-600 mt-1">Note: You'll be prompted to switch to Push Chain network.</p>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded-lg mt-2 text-sm">
              <p>Your market will be deployed on Ethereum Sepolia testnet.</p>
              {chain?.id !== deploymentChain.id && (
                <p className="text-orange-600 mt-1">Note: You'll be prompted to switch to Ethereum Sepolia network.</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Date *
              </label>
              <input
                type="date"
                value={resolveDate}
                onChange={(e) => setResolveDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Time *
              </label>
              <input
                type="time"
                value={resolveTime}
                onChange={(e) => setResolveTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                required
              />
            </div>
          </div>

            <div className="bg-neutral-900/10 p-4 rounded-lg">
              <h4 className="font-medium text-amber-400 mb-2">Market Guidelines</h4>
              <ul className="text-sm text-amber-300 space-y-1">
              <li>• Questions should be binary (YES/NO)</li>
              <li>• Be specific about the outcome being measured</li>
              <li>• Set realistic resolution times</li>
              <li>• Consider using objective data sources</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isPending || isNetworkSwitching || !question || !resolveDate || !resolveTime}
              className="flex-1 bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isNetworkSwitching ? 'Switching Network...' : isPending ? 'Creating Market...' : `Create Market on ${deployToPushChain ? 'Push Chain' : 'Sepolia'}`}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}