'use client'
import { useWallet } from '@aptos-labs/wallet-adapter-react'

export default function ConnectButton() {
  const { connect, disconnect, wallets, connected, account } = useWallet()

  const formatAddress = (addr?: string) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '')

  const onConnect = async () => {
    // If you want to target a specific wallet, pass its name: connect(wallet.name)
    // For now, try default connect flow which may prompt available wallets
    try {
      if (wallets.length > 0) {
        await connect(wallets[0].name)
      } else {
        alert('No Aptos wallet found. Please install Petra, Martian, etc.')
      }
    } catch (e) {
      console.error('Aptos connect failed', e)
      alert('Aptos wallet connection failed.')
    }
  }

  return (
    <div className="relative">
      {!connected ? (
        <button
          onClick={onConnect}
          type="button"
          className="bg-black text-amber-400 font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all hover:bg-neutral-900 border border-amber-600/20"
        >
          Connect Aptos Wallet
        </button>
      ) : (
        <div className="flex items-center space-x-3">
          <div className="relative group">
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
          </div>
        </div>
      )}
    </div>
  )
}