'use client'
import { useState } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'

interface CreateMarketFormProps {
  factoryAddress?: string
  onMarketCreated?: (marketAddress: string) => void
}

export default function CreateMarketForm({ factoryAddress, onMarketCreated }: CreateMarketFormProps) {
  const { account, connected, signAndSubmitTransaction } = useWallet()
  const [question, setQuestion] = useState('')
  const [resolveDate, setResolveDate] = useState('')
  const [resolveTime, setResolveTime] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [deployToPushChain, setDeployToPushChain] = useState(false) // keep UI parity, but noop
  const [isNetworkSwitching, setIsNetworkSwitching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const NODE_URL = process.env.NEXT_PUBLIC_APTOS_NODE_URL || 'https://fullnode.devnet.aptoslabs.com'
  const MODULE_ADDR = process.env.NEXT_PUBLIC_MOVE_MODULE_ADDRESS || factoryAddress || ''

  const ensureConnected = () => {
    if (!connected || !account) {
      alert('Please connect your Aptos wallet to create markets')
      return false
    }
    return true
  }

  const waitForTxn = async (hash: string, timeoutMs = 60_000) => {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      try {
        const res = await fetch(`${NODE_URL}/transactions/by_hash/${hash}`)
        if (res.ok) {
          const data = await res.json()
          if (data.success !== undefined || data.vm_status) {
            // transaction found (status available)
            return data
          }
        }
      } catch (e) {
        // ignore and retry
      }
      await new Promise((r) => setTimeout(r, 1000))
    }
    throw new Error('Transaction confirmation timed out')
  }

  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question || !resolveDate || !resolveTime) return
    if (!ensureConnected()) return
    if (!MODULE_ADDR) {
      alert('Move module address not configured. Set NEXT_PUBLIC_MOVE_MODULE_ADDRESS.')
      return
    }

    try {
      const resolveDateTime = new Date(`${resolveDate}T${resolveTime}`)
      const resolveTs = Math.floor(resolveDateTime.getTime() / 1000)
      if (resolveTs <= Date.now() / 1000) {
        alert('Resolution time must be in the future')
        return
      }

      setIsSubmitting(true)

      // Example payload: calling a Move entry function `create_market` in your module
      // Adjust the argument types and order to match your Move function signature.
      const entryFunctionPayload = {
        function: `${MODULE_ADDR}::marketplace::create_market`,
        type_arguments: [],
        arguments: [question, `${resolveTs}`],
      }

      const txnHash = await signAndSubmitTransaction({
        type: 'entry_function_payload',
        ...entryFunctionPayload,
      } as any) // wallet adapter's signAndSubmitTransaction expects a broad payload object

      // Some adapters return the whole txn result, others return hash — normalize:
      let hashStr = typeof txnHash === 'string' ? txnHash : (txnHash as any)?.hash || (txnHash as any)?.transaction_hash

      // If we have a txn hash, wait for confirmation (best-effort)
      if (hashStr) {
        try {
          await waitForTxn(hashStr, 60_000)
        } catch (err) {
          console.warn('Could not confirm txn within timeout', err)
        }
      }

      setQuestion('')
      setResolveDate('')
      setResolveTime('')
      setShowForm(false)
      onMarketCreated?.(hashStr ?? '')
    } catch (error) {
      console.error('Market creation failed:', error)
      alert('Market creation failed. See console for details.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Only show "connect wallet" if truly not connected
  if (!connected || !account) {
    return (
      <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
        <p className="text-gray-500">Please connect your Aptos wallet to create markets</p>
      </div>
    )
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-lg">
      {!showForm ? (
        <div className="text-center">
          <h3 className="text-xl font-semibold tracking-tight text-gray-900">Create a market</h3>
          <p className="mt-2 text-sm text-gray-500">Spin up a new binary market with a clear question and a future resolution time.</p>
          <div className="mt-6">
            <button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-700 text-black font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all">New market</button>
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
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Will Bitcoin reach $100,000 by the end of 2025?"
              required
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
            <p className="text-xs text-gray-500">Be specific and unambiguous. Include any objective data sources if needed.</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="deployToPushChain"
              checked={deployToPushChain}
              onChange={(e) => setDeployToPushChain((e.target as HTMLInputElement).checked)}
              className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
            />
            <label htmlFor="deployToPushChain" className="text-sm text-gray-700">
              (UI toggle kept for compatibility) Deploy to cross-chain (noop for Aptos)
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Resolution date</label>
              <input
                type="date"
                value={resolveDate}
                onChange={(e) => setResolveDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Resolution time</label>
              <input
                type="time"
                value={resolveTime}
                onChange={(e) => setResolveTime(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
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
            <button
              type="submit"
              disabled={isSubmitting || isNetworkSwitching || !question || !resolveDate || !resolveTime}
              className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-black font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              {isNetworkSwitching ? 'Switching network…' : isSubmitting ? 'Creating market…' : `Create on Aptos`}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
