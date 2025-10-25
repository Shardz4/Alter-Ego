'use client'
import { useState } from 'react'
import { useAccount } from 'wagmi'

// This component demonstrates how to integrate Push Chain's cross-chain functionality
const PushChainBridge = () => {
  const { address, isConnected } = useAccount()
  const [amount, setAmount] = useState('')
  const [sourceChain, setSourceChain] = useState('ethereum')
  const [targetChain, setTargetChain] = useState('push')
  const [isLoading, setIsLoading] = useState(false)

  // Mock chains for demonstration
  const chains = [
    { id: 'ethereum', name: 'Ethereum', icon: '🔷' },
    { id: 'push', name: 'Push Chain', icon: '🔄' },
    { id: 'polygon', name: 'Polygon', icon: '🟣' }
  ]

  const handleBridge = async () => {
    if (!isConnected || !amount) return
    
    setIsLoading(true)
    
    try {
      // This would be replaced with actual Push Chain bridge SDK calls
      console.log(`Bridging ${amount} from ${sourceChain} to ${targetChain}`)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      alert(`Successfully initiated bridge of ${amount} tokens from ${sourceChain} to ${targetChain}`)
      setAmount('')
    } catch (error) {
      console.error('Bridge error:', error)
      alert('Failed to bridge tokens. See console for details.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
        <p className="text-white text-center">Connect your wallet to use the bridge</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4">Push Chain Bridge</h2>
      
      <div className="space-y-4">
        <div className="flex flex-col">
          <label className="text-gray-300 mb-1">Amount</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:border-amber-400 focus:outline-none"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-gray-300 mb-1">From</label>
            <select
              value={sourceChain}
              onChange={(e) => setSourceChain(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:border-amber-400 focus:outline-none"
            >
              {chains.map(chain => (
                <option key={chain.id} value={chain.id}>
                  {chain.icon} {chain.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-gray-300 mb-1">To</label>
            <select
              value={targetChain}
              onChange={(e) => setTargetChain(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:border-amber-400 focus:outline-none"
            >
              {chains.map(chain => (
                <option key={chain.id} value={chain.id}>
                  {chain.icon} {chain.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={handleBridge}
          disabled={!amount || isLoading || sourceChain === targetChain}
            className={`w-full bg-amber-600 hover:bg-amber-700 text-black font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${(!amount || isLoading || sourceChain === targetChain) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Processing...' : 'Bridge Tokens'}
        </button>
        
        <p className="text-xs text-gray-400 mt-2">
          Note: This is a demonstration component. To use actual Push Chain functionality, 
          install @pushchain/ui-kit and replace this with the official components.
        </p>
      </div>
    </div>
  )
}

export default PushChainBridge