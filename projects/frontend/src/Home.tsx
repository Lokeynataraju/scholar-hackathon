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
  const [theme, setTheme] = useState(localStorage.getItem('scholar_theme') || 'light')

  // Handle URL params for QR Code scanning
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')
    const addressParam = params.get('address')

    if (tabParam === 'verify') {
      setActiveTab('verify')
    }

    if (addressParam) {
      sessionStorage.setItem('verify_address', addressParam)
    }
  }, [])

  // Theme Toggle Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('scholar_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

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

        const appId = BigInt(import.meta.env.VITE_SCHOLAR_SBT_APP_ID ?? '755768739')

        const client = new ScholarSbtClient({
          algorand,
          appId,
          defaultSender: activeAddress || undefined,
        })

        // Set client immediately — don't block on API call
        setAppClient(client)

        // Fetch admin address in background (non-blocking)
        client.state.global.getAll().then(state => {
          if (state.admin) setAdminAddress(state.admin)
        }).catch(e => {
          console.warn('Could not fetch admin (API may be rate-limited):', e)
        })
      } catch (e) {
        console.error('Error initializing client:', e)
        // Still set a dummy client so UI renders
        const algodConfig = getAlgodConfigFromViteEnvironment()
        const algorand = AlgorandClient.fromConfig({ algodConfig })
        const appId = BigInt(import.meta.env.VITE_SCHOLAR_SBT_APP_ID ?? '755768739')
        setAppClient(new ScholarSbtClient({ algorand, appId }))
      }
    }

    initClient()
  }, [activeAddress, transactionSigner])

  return (
    <div className="min-h-screen bg-base-200 font-sans text-base-content selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <div className="navbar fixed top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-content/5 px-6 sm:px-12 h-20 transition-all duration-300">
        <div className="flex-1">
          <a onClick={() => setActiveTab('student')} className="btn btn-ghost normal-case text-2xl font-black tracking-tight gap-2 hover:bg-transparent cursor-pointer">
            <span className="text-3xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">🎓</span>
            <span className="text-base-content">Scholar<span className="text-blue-600">SBT</span></span>
          </a>
        </div>
        <div className="flex-none gap-4 md:gap-6">
          <ul className="menu menu-horizontal px-1 hidden md:flex gap-2">
            <li><a onClick={() => setActiveTab('student')} className={`font-bold rounded-full px-6 transition-all ${activeTab === 'student' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-base-content'}`}>Dashboard</a></li>
            <li><a onClick={() => setActiveTab('verify')} className={`font-bold rounded-full px-6 transition-all ${activeTab === 'verify' ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:text-base-content'}`}>Verify</a></li>
            {activeAddress === adminAddress && (
              <li><a onClick={() => setActiveTab('admin')} className={`font-bold rounded-full px-6 transition-all text-orange-500 hover:bg-orange-50`}>Admin</a></li>
            )}
          </ul>

          {/* Theme Toggle */}
          <button className="btn btn-circle btn-ghost" onClick={toggleTheme} title="Toggle Dark/Light Mode">
            {theme === 'light' ? (
              <span className="text-xl">🌙</span>
            ) : (
              <span className="text-xl">☀️</span>
            )}
          </button>

          <button
            className={`btn rounded-full px-8 font-bold border-0 transition-all duration-300 ${activeAddress
              ? 'bg-base-200 text-base-content hover:bg-base-300'
              : 'bg-primary text-primary-content hover:shadow-lg hover:shadow-primary/30 hover:scale-105'
              }`}
            onClick={toggleWalletModal}
          >
            {activeAddress ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {activeAddress.slice(0, 4)}...{activeAddress.slice(-4)}
              </span>
            ) : 'Connect Wallet'}
          </button>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────── */}
      <div className="pt-24 pb-20 min-h-screen">
        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />

        {!appClient ? (
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <span className="loading loading-spinner loading-lg text-blue-600"></span>
            <p className="mt-6 text-slate-400 font-medium animate-pulse">Initializing Algorand Connection...</p>
          </div>
        ) : (
          <div className="fade-in">
            {activeTab === 'student' && (
              activeAddress ? (
                <div className="container mx-auto px-4 max-w-6xl">
                  <StudentPanel appClient={appClient} activeAddress={activeAddress} />
                </div>
              ) : (
                // ── LANDING PAGE HERO ────────────────────────────────
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl min-h-[75vh] flex items-center justify-center text-center px-4">
                    {/* Dynamic Background */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
                    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] mix-blend-screen animate-pulse"></div>

                    <div className="relative z-10 max-w-4xl mx-auto py-20 flex flex-col items-center">
                      <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white/10 text-blue-200 text-xs font-bold uppercase tracking-widest border border-white/10 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        Live on Algorand Testnet
                      </div>

                      <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1] mb-8">
                        Fake Certificates End <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Right Here.</span>
                      </h1>

                      <p className="text-xl text-slate-300 max-w-2xl leading-relaxed mb-12">
                        The world's first <span className="text-white font-semibold">Soulbound Token (SBT)</span> platform for academic credentials.
                        Tamper-proof, instantly verifiable, and 100% owned by you.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <button
                          className="btn btn-lg bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-2xl px-12 font-bold shadow-xl shadow-blue-900/50 hover:scale-105 transition-all"
                          onClick={toggleWalletModal}
                        >
                          Get Started for Free
                        </button>
                        <button onClick={() => { document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' }) }} className="btn btn-lg btn-ghost text-white border border-white/10 hover:bg-white/10 rounded-2xl px-12">
                          How it Works
                        </button>
                      </div>

                      {/* Trust Badges */}
                      <div className="mt-16 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Powered By</span>
                        <div className="flex items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                          <span className="text-xl font-bold text-white tracking-tight">Algorand</span>
                          <span className="text-xl font-bold text-white tracking-tight">Pera Wallet</span>
                          <span className="text-xl font-bold text-white tracking-tight">IPFS</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── STATS SECTION ─────────────────────────────── */}
                  <div className="py-24" id="how">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {[
                        { num: 'Immutable', label: 'Records are permanent and tamper-proof on-chain.', icon: '🔒' },
                        { num: 'Instant', label: 'Verification takes <2 seconds for any employer.', icon: '⚡' },
                        { num: 'Global', label: 'Recognized standards compatible with major wallets.', icon: '🌍' },
                      ].map((s, i) => (
                        <div key={i} className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-transform duration-500">
                          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6">{s.icon}</div>
                          <h3 className="text-2xl font-black text-slate-900 mb-2">{s.num}</h3>
                          <p className="text-slate-500 font-medium leading-relaxed">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}

            {activeTab === 'admin' && (
              <div className="container mx-auto px-4 max-w-6xl">
                <AdminPanel appClient={appClient} adminAddress={adminAddress} activeAddress={activeAddress || ''} />
              </div>
            )}

            {activeTab === 'verify' && (
              <VerifyPage activeAddress={activeAddress ?? undefined} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
