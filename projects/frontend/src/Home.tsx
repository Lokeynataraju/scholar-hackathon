// src/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState, useEffect } from 'react'
import ConnectWallet from './components/ConnectWallet'
import AdminPanel from './components/AdminPanel'
import StudentPanel from './components/StudentPanel'
import VerifyPage from './components/VerifyPage'
import { ScholarSbtClient } from './contracts/ScholarSBTClient'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

interface HomeProps { }

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const { activeAddress, transactionSigner } = useWallet()
  const [appClient, setAppClient] = useState<ScholarSbtClient | null>(null)
  const [adminAddress, setAdminAddress] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'student' | 'admin' | 'verify'>('student')

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  useEffect(() => {
    const initClient = async () => {
      const algodConfig = getAlgodConfigFromViteEnvironment()
      const algorand = AlgorandClient.fromConfig({ algodConfig })

      if (activeAddress && transactionSigner) {
        algorand.setSigner(activeAddress, transactionSigner)
      }

      const client = new ScholarSbtClient({
        algorand,
        appId: BigInt(import.meta.env.VITE_SCHOLAR_SBT_APP_ID),
      })

      setAppClient(client)

      // Fetch admin address
      try {
        const state = await client.state.global.getAll()
        if (state.admin) {
          setAdminAddress(state.admin)
        }
      } catch (e) {
        console.error('Error fetching global state:', e)
      }
    }

    initClient()
  }, [activeAddress, transactionSigner])

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-lg px-4">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl text-primary font-bold">PW Scholar-SBT</a>
        </div>
        <div className="flex-none gap-2">
          <ul className="menu menu-horizontal px-1">
            <li><a onClick={() => setActiveTab('student')} className={activeTab === 'student' ? 'active' : ''}>Student</a></li>
            <li><a onClick={() => setActiveTab('verify')} className={activeTab === 'verify' ? 'active' : ''}>Verify</a></li>
            {activeAddress === adminAddress && (
              <li><a onClick={() => setActiveTab('admin')} className={activeTab === 'admin' ? 'active' : ''}>Admin</a></li>
            )}
          </ul>
          <button className="btn btn-outline" onClick={toggleWalletModal}>
            {activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` : 'Connect Wallet'}
          </button>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-4xl">
        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />

        <div className="content mt-6">
          {!appClient ? (
            <div className="text-center mt-10">Loading Contract...</div>
          ) : (
            <>
              {activeTab === 'student' && (
                activeAddress ? (
                  <StudentPanel appClient={appClient} activeAddress={activeAddress} />
                ) : (
                  <div className="alert alert-warning shadow-lg">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      <span>Please connect your wallet to access the Student Dashboard.</span>
                    </div>
                  </div>
                )
              )}

              {activeTab === 'admin' && (
                <AdminPanel appClient={appClient} adminAddress={adminAddress} activeAddress={activeAddress || ''} />
              )}

              {activeTab === 'verify' && (
                <VerifyPage appClient={appClient} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
