'use client'
import { useState } from 'react'
import { useWriteContract, useAccount, useSwitchChain, usePublicClient, useWalletClient } from 'wagmi'
import { pushDonutTestnet as pushChain, deploymentChain } from '@/config/chains'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Textarea } from './ui/Textarea'
import { Checkbox } from './ui/Checkbox'
import { Card } from './ui/Card'

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
    <Card>
      {!showForm ? (
        <div className="text-center">
          <h3 className="text-xl font-semibold tracking-tight text-gray-900">Create a market</h3>
          <p className="mt-2 text-sm text-gray-500">Spin up a new binary market with a clear question and a future resolution time.</p>
          <div className="mt-6">
            <Button onClick={() => setShowForm(true)} size="md">New market</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreateMarket} className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold tracking-tight text-gray-900">Create a market</h3>
            <p className="text-sm text-gray-500">Define your question and when it will resolve. Markets are binary (YES/NO).</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Market question</label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Will Bitcoin reach $100,000 by the end of 2024?"
              required
              rows={3}
            />
            <p className="text-xs text-gray-500">Be specific and unambiguous. Include any objective data sources if needed.</p>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="deployToPushChain"
              checked={deployToPushChain}
              onChange={(e) => setDeployToPushChain((e.target as HTMLInputElement).checked)}
            />
            <label htmlFor="deployToPushChain" className="text-sm text-gray-700">
              Deploy to Push Chain (cross-chain)
            </label>
          </div>

          {deployToPushChain ? (
            <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
              <p>Your market will be deployed on Push Chain, enabling cross-chain trading and liquidity.</p>
              {chain?.id !== pushChain.id && (
                <p className="mt-1">You'll be prompted to switch to the Push Chain network.</p>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              <p>Your market will be deployed on Ethereum Sepolia testnet.</p>
              {chain?.id !== deploymentChain.id && (
                <p className="mt-1">You'll be prompted to switch to the Sepolia network.</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Resolution date</label>
              <Input
                type="date"
                value={resolveDate}
                onChange={(e) => setResolveDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Resolution time</label>
              <Input
                type="time"
                value={resolveTime}
                onChange={(e) => setResolveTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="text-sm font-medium text-gray-900">Market guidelines</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-gray-600">
              <li>Questions should be binary (YES/NO)</li>
              <li>Be specific about the outcome being measured</li>
              <li>Set realistic resolution times</li>
              <li>Consider using objective data sources</li>
            </ul>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={isPending || isNetworkSwitching || !question || !resolveDate || !resolveTime}
              fullWidth
            >
              {isNetworkSwitching ? 'Switching network…' : isPending ? 'Creating market…' : `Create on ${deployToPushChain ? 'Push Chain' : 'Sepolia'}`}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}