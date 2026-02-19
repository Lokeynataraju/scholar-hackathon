import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import { useState, useEffect, useRef } from 'react'

interface ConnectWalletInterface {
  openModal: boolean
  closeModal: () => void
}

const ConnectWallet = ({ openModal, closeModal }: ConnectWalletInterface) => {
  const { wallets, activeAddress } = useWallet()
  const [copied, setCopied] = useState(false)
  const prevAddressRef = useRef<string | null>(null)
  // Store closeModal in a ref so useEffect doesn't re-run when the function reference changes
  const closeModalRef = useRef(closeModal)
  useEffect(() => { closeModalRef.current = closeModal }, [closeModal])

  // Auto-close modal when wallet connects (Pera QR scan completes)
  useEffect(() => {
    if (activeAddress && !prevAddressRef.current && openModal) {
      setTimeout(() => closeModalRef.current(), 600)
    }
    prevAddressRef.current = activeAddress
  }, [activeAddress, openModal]) // closeModal intentionally omitted — using ref above

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD
  const isMnemonic = (wallet: Wallet) => wallet.id === WalletId.MNEMONIC

  const handleCopy = () => {
    if (activeAddress) {
      navigator.clipboard.writeText(activeAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <dialog id="connect_wallet_modal" className={`modal backdrop-blur-sm transition-all duration-300 ${openModal ? 'modal-open' : ''}`}>
      <div className="modal-box bg-slate-900/90 border border-white/10 shadow-2xl rounded-3xl p-0 overflow-hidden max-w-md">

        {/* Header Gradient */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 w-full" />

        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-2xl tracking-tight text-white flex gap-2 items-center">
              <span className="text-3xl">👛</span>
              Your Wallet
            </h3>
            <button
              onClick={closeModal}
              className="btn btn-circle btn-ghost btn-sm text-slate-400 hover:text-white hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          {activeAddress ? (
            // CONNECTED STATE
            <div className="animate-fade-in-up">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mb-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-50 text-6xl pointer-events-none grayscale group-hover:grayscale-0 transition-all duration-500">
                  🌱
                </div>

                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-1">
                    <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-2xl text-white">
                      ⚡
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Connected</h4>
                    <span className="badge badge-success badge-sm gap-1 pl-1.5 pr-2 font-bold text-xs uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Testnet
                    </span>
                  </div>
                </div>

                <div
                  className="bg-black/30 rounded-xl p-3 flex items-center justify-between gap-2 border border-white/5 cursor-pointer hover:bg-black/40 transition-colors group/copy relative z-10"
                  onClick={handleCopy}
                >
                  <code className="text-slate-300 text-sm font-mono truncate">
                    {activeAddress}
                  </code>
                  <div className="text-slate-400 group-hover/copy:text-white transition-colors">
                    {copied ? '✅' : '📋'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  className="btn btn-error btn-outline border-error/50 hover:bg-error/10 w-full capitalize font-bold"
                  onClick={async () => {
                    if (wallets) {
                      const activeWallet = wallets.find((w) => w.isActive)
                      if (activeWallet) {
                        await activeWallet.disconnect()
                      }
                      localStorage.removeItem('scholar_wallet_id')
                      window.location.reload()
                    }
                  }}
                >
                  Disconnect
                </button>
                <button className="btn btn-ghost bg-white/5 hover:bg-white/10 text-slate-300 font-normal capitalize" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          ) : (
            // DISCONNECTED STATE (PROVIDER LIST)
            <div className="space-y-3">
              <p className="text-slate-400 text-sm mb-4 font-medium">Select a provider to connect:</p>

              {wallets?.map((wallet) => {
                const isPera = wallet.id === 'pera' || wallet.id === 'pera2'
                const isDefly = wallet.id === 'defly'
                const getDesc = () => {
                  if (isMnemonic(wallet)) return 'Enter passphrase manually (Dev only)'
                  if (isPera) return 'Official Algorand mobile wallet'
                  if (isDefly) return 'DeFi-focused Algorand wallet'
                  return 'Connect via wallet app'
                }
                return (
                  <button
                    key={`provider-${wallet.id}`}
                    onClick={() => {
                      if (isPera || isDefly) {
                        // Close dialog first (it traps z-index otherwise)
                        // Then fire connect after a short delay
                        closeModal()
                        setTimeout(() => wallet.connect(), 400)
                      } else {
                        wallet.connect()
                        closeModal()
                      }
                    }}
                    className="w-full bg-white/5 hover:bg-white/10 hover:border-blue-500/50 border border-white/5 rounded-xl p-4 flex items-center gap-4 transition-all duration-300 group text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white p-1.5 shadow-lg group-hover:scale-110 transition-transform">
                      {isMnemonic(wallet) ? (
                        <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center text-lg rounded font-bold">⌨️</div>
                      ) : (
                        <img
                          alt={`wallet_icon_${wallet.id}`}
                          src={wallet.metadata.icon}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                          {isKmd(wallet) ? 'LocalNet Wallet' : isMnemonic(wallet) ? 'Mnemonic (Dev/Test)' : wallet.metadata.name}
                        </h5>
                        {isPera && (
                          <span className="text-[9px] font-bold uppercase tracking-widest bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full border border-blue-500/30">
                            ✦ Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{getDesc()}</p>
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 text-blue-500">
                      →
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-black/20 py-3 px-8 text-center border-t border-white/5">
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
            Secured by Algorand
          </p>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop bg-black/50 backdrop-blur-sm">
        <button onClick={closeModal}>close</button>
      </form>
    </dialog>
  )
}
export default ConnectWallet
