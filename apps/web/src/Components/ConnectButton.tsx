'use client'
import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { metaMask } from 'wagmi/connectors'

export default function ConnectButton() {
  const { address, isConnected, chain } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  // no push chain toggle

  // Format address for display
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return ''
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  const connectMeta = async () => {
    try {
      await connect({ connector: metaMask() })
    } catch (err) {
      console.error('MetaMask connect failed', err)
      alert('MetaMask connection failed. Please ensure MetaMask is installed and unlocked.')
    }
  }

  const chainAny = chain as any

  return (
    <div className="relative">
      {!isConnected ? (
        <div className="flex items-center space-x-2">
          <button
            onClick={connectMeta}
            type="button"
            className="bg-black text-amber-400 font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all hover:bg-neutral-900 border border-amber-600/20"
          >
            Connect MetaMask
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          {chainAny?.unsupported && (
            <div className="relative group">
              <button
                onClick={() => disconnect()}
                type="button"
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm"
              >
                Wrong Network
              </button>
            </div>
          )}

          {!chainAny?.unsupported && (
            <>
              <button
                type="button"
                className="bg-neutral-900 text-gray-200 font-medium py-2 px-4 rounded-lg shadow-sm flex items-center space-x-2"
              >
                {chainAny?.hasIcon && (
                  <div
                    style={{
                      background: chainAny.iconBackground,
                      width: 20,
                      height: 20,
                      borderRadius: 999,
                      overflow: 'hidden',
                      marginRight: 4,
                    }}
                  >
                    {chainAny.iconUrl && (
                      <img
                        alt={chainAny.name ?? 'Chain icon'}
                        src={chainAny.iconUrl}
                        style={{ width: 20, height: 20 }}
                      />
                    )}
                  </div>
                )}
                <span>{chainAny?.name || 'Unknown'}</span>
              </button>

              <div className="relative group">
                <button
                  onClick={() => disconnect()}
                  type="button"
                  className="bg-black hover:bg-neutral-900 text-amber-400 font-bold py-2 px-4 rounded-lg shadow-sm border border-amber-600/20"
                >
                  <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>{formatAddress(address)}</span>
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}