import { NetworkId, SupportedWallet, WalletId, WalletManager, WalletProvider, useWallet } from '@txnlab/use-wallet-react'
import { SnackbarProvider } from 'notistack'
import { useEffect } from 'react'
import Home from './Home'
import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

// 416002 = Testnet, 416001 = Mainnet
const ALGORAND_CHAIN_IDS = {
  mainnet: 416001,
  testnet: 416002,
  betanet: 416003,
}

let supportedWallets: SupportedWallet[]
if (import.meta.env.VITE_ALGOD_NETWORK === 'localnet') {
  const kmdConfig = getKmdConfigFromViteEnvironment()
  supportedWallets = [
    {
      id: WalletId.KMD,
      options: {
        baseServer: kmdConfig.server,
        token: String(kmdConfig.token),
        port: String(kmdConfig.port),
      },
    },
  ]
} else {
  supportedWallets = [
    { id: WalletId.PERA },
    { id: WalletId.DEFLY },
    { id: WalletId.MNEMONIC },
  ]
}


const algodConfig = getAlgodConfigFromViteEnvironment()
const walletManager = new WalletManager({
  wallets: supportedWallets,
  network: algodConfig.network as NetworkId,
})

export default function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <WalletPersistence>
          <Home />
        </WalletPersistence>
      </WalletProvider>
    </SnackbarProvider>
  )
}


function WalletPersistence({ children }: { children: React.ReactNode }) {
  const { wallets, activeWallet } = useWallet()

  useEffect(() => {
    const restore = async () => {
      // console.log('Attempting to restore wallet...')
      // Check if we have a stored wallet preference
      // In this library, the manager usually handles auto-resume if configured,
      // but for Mnemonic wallet we might need to force it.
      const lastWalletId = localStorage.getItem('scholar_wallet_id')

      if (lastWalletId && !activeWallet) {
        const wallet = wallets.find(w => w.id === lastWalletId)
        if (wallet) {
          try {
            await wallet.connect()
            // console.log('Restored wallet:', lastWalletId)
          } catch (e) {
            console.error('Failed to restore wallet session:', e)
            localStorage.removeItem('scholar_wallet_id')
          }
        }
      }
    }
    restore()
  }, [wallets, activeWallet])

  // Save successful connection
  useEffect(() => {
    if (activeWallet) {
      localStorage.setItem('scholar_wallet_id', activeWallet.id)
    }
  }, [activeWallet])

  return <>{children}</>
}
