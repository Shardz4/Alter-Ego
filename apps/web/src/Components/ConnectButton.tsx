'use client'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, User } from '@/lib/firebase'

export default function ConnectButton() {
  const { connect, disconnect, connected, account, wallets } = useWallet()
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged((u: User | null) => setFirebaseUser(u))
    return () => unsub()
  }, [])

  const formatAddress = (addr?: any) => {
    const addrStr = typeof addr === 'string' ? addr : addr?.toString?.() || ''
    return addrStr ? `${addrStr.slice(0, 6)}...${addrStr.slice(-4)}` : ''
  }

  const handleConnect = async () => {
    // Check if user is authenticated with Firebase first
    if (!firebaseUser) {
      alert('⚠️ Please sign in with Firebase first before connecting your wallet.')
      return
    }

    try {
      if (!wallets || wallets.length === 0) {
        alert('No Aptos wallets detected. Please install Petra, Martian, Pontem, etc.')
        return
      }

      // 🩹 Cast each wallet to “any” or a known shape
      const targetWallet = wallets[0] as any
      if (!targetWallet?.name) {
        alert('No valid wallet found.')
        return
      }

      await connect(targetWallet.name)
    } catch (err) {
      console.error('Aptos wallet connection failed:', err)
      alert('Failed to connect wallet.')
    }
  }

  return (
    <div className="relative">
      {!connected ? (
        <button
          onClick={handleConnect}
          type="button"
          className="bg-black text-amber-400 font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all hover:bg-neutral-900 border border-amber-600/20"
        >
          Connect Aptos Wallet
        </button>
      ) : (
        <button
          onClick={() => disconnect()}
          type="button"
          className="bg-black hover:bg-neutral-900 text-amber-400 font-bold py-2 px-4 rounded-lg shadow-sm border border-amber-600/20"
        >
          <span className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>{formatAddress(account?.address)}</span>
          </span>
        </button>
      )}
    </div>
  )
}
