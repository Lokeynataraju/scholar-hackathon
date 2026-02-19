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
      try {
        const algodConfig = getAlgodConfigFromViteEnvironment()
        const algorand = AlgorandClient.fromConfig({ algodConfig })

        if (activeAddress && transactionSigner) {
          algorand.setSigner(activeAddress, transactionSigner)
        }

        // Fallback to deployed testnet App ID if env var not set
        const appId = BigInt(import.meta.env.VITE_SCHOLAR_SBT_APP_ID ?? '755768739')

        const client = new ScholarSbtClient({
          algorand,
          appId,
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
      } catch (e) {
        console.error('Error initializing client:', e)
      }
    }

    initClient()
  }, [activeAddress, transactionSigner])

  return (
    <div className="min-h-screen bg-base-200 font-sans">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-md px-4 sm:px-8">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-2xl text-primary font-bold gap-2">
            <span className="text-3xl">🎓</span> PW Scholar
          </a>
        </div>
        <div className="flex-none gap-4">
          <ul className="menu menu-horizontal px-1 bg-base-200 rounded-box hidden sm:flex">
            <li><a onClick={() => setActiveTab('student')} className={activeTab === 'student' ? 'active font-bold' : ''}>Student Dashboard</a></li>
            <li><a onClick={() => setActiveTab('verify')} className={activeTab === 'verify' ? 'active font-bold' : ''}>Verify Credentials</a></li>
            {activeAddress === adminAddress && (
              <li><a onClick={() => setActiveTab('admin')} className={`text-error ${activeTab === 'admin' ? 'active font-bold' : ''}`}>Admin Panel</a></li>
            )}
          </ul>
          <div className="dropdown dropdown-end sm:hidden">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
            </label>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><a onClick={() => setActiveTab('student')}>Student</a></li>
              <li><a onClick={() => setActiveTab('verify')}>Verify</a></li>
              {activeAddress === adminAddress && <li><a onClick={() => setActiveTab('admin')}>Admin</a></li>}
            </ul>
          </div>
          <button
            className={`btn ${activeAddress ? 'btn-success text-white' : 'btn-primary'}`}
            onClick={toggleWalletModal}
          >
            {activeAddress ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                {activeAddress.slice(0, 4)}...{activeAddress.slice(-4)}
              </>
            ) : 'Connect Wallet'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 max-w-5xl py-10">
        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />

        {!appClient ? (
          <div className="flex flex-col items-center justify-center h-64">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4 text-base-content/70">Connecting to Algorand...</p>
          </div>
        ) : (
          <div className="fade-in">
            {activeTab === 'student' && (
              activeAddress ? (
                <StudentPanel appClient={appClient} activeAddress={activeAddress} />
              ) : (
                <div className="hero min-h-[60vh] bg-base-100 rounded-3xl shadow-xl overflow-hidden">
                  <div className="hero-content text-center">
                    <div className="max-w-md">
                      <h1 className="text-5xl font-bold text-primary">Your Academic Identity</h1>
                      <p className="py-6 text-lg">
                        Secure, verifiable, and permanent. Claim your Scholar Soulbound Tokens (SBTs) on the Algorand blockchain.
                      </p>
                      <button className="btn btn-primary btn-lg shadow-lg hover:scale-105 transition-transform" onClick={toggleWalletModal}>
                        Connect Wallet to Start
                      </button>
                    </div>
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
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer footer-center p-4 bg-base-300 text-base-content rounded-t-lg mt-10">
        <aside>
          <p>Built for RIFT 2026 Hackathon • Powered by Algorand</p>
        </aside>
      </footer>
    </div>
  )
}

export default Home
