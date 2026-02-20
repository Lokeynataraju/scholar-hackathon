// src/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState, useEffect } from 'react'
import ConnectWallet from './components/ConnectWallet'
import AdminPanel from './components/AdminPanel'
import StudentPanel from './components/StudentPanel'
import VerifyPage from './components/VerifyPage'
import Sidebar from './components/Sidebar' // New Component
import DashboardHeader from './components/DashboardHeader' // New Component
import { ScholarSbtClient } from './contracts/ScholarSBTClient'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

interface HomeProps { }

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  // Essential: Removed transactionSigner from here to prevent infinite loop (fixed in previous step)
  const { activeAddress } = useWallet()
  const [appClient, setAppClient] = useState<ScholarSbtClient | null>(null)
  const [adminAddress, setAdminAddress] = useState<string>('')

  // New: 'dashboard' is default when logged in. Can also be 'watch', 'verify', etc.
  const [activeTab, setActiveTab] = useState<string>('dashboard')
  const [theme, setTheme] = useState(localStorage.getItem('scholar_theme') || 'light')

  // Handle URL params for QR Code scanning deep links
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

  // Theme Toggle Effect (Persisted for DaisyUI/Tailwind)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('scholar_theme', theme)
  }, [theme])

  const openModal = () => setOpenWalletModal(true)
  const closeModal = () => setOpenWalletModal(false)

  useEffect(() => {
    const initClient = async () => {
      try {
        const algodConfig = getAlgodConfigFromViteEnvironment()
        const algorand = AlgorandClient.fromConfig({ algodConfig })

        // Use Testnet App ID
        const appId = BigInt(import.meta.env.VITE_SCHOLAR_SBT_APP_ID ?? '755768738')

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
        // Fallback dummy client so UI renders even if network fails
        const algodConfig = getAlgodConfigFromViteEnvironment()
        const algorand = AlgorandClient.fromConfig({ algodConfig })
        const appId = BigInt(import.meta.env.VITE_SCHOLAR_SBT_APP_ID ?? '755768738')
        setAppClient(new ScholarSbtClient({ algorand, appId }))
      }
    }

    initClient()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAddress])

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
      {/* Global Wallet Modal */}
      <ConnectWallet openModal={openWalletModal} closeModal={closeModal} />

      {!activeAddress ? (
        // ── LANDING PAGE (Disconnected State) ────────────────────────────
        <div className="min-h-screen bg-slate-900 overflow-x-hidden">
          {/* Navbar for Landing */}
          <div className="navbar fixed top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-6 sm:px-12 h-20">
            <div className="flex-1">
              <a className="btn btn-ghost normal-case text-2xl font-black gap-2 hover:bg-transparent">
                <span className="text-3xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400">🎓</span>
                <span>Scholar<span className="text-blue-500">SBT</span></span>
              </a>
            </div>
            <div className="flex-none">
              <button onClick={openModal} className="btn bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-full px-8 font-bold shadow-lg shadow-blue-900/40 hover:shadow-blue-500/20 transition-all">
                Connect Wallet
              </button>
            </div>
          </div>

          {/* Hero Section */}
          <div className="pt-32 pb-20 px-4">
            <div className="max-w-7xl mx-auto relative rounded-[3rem] overflow-hidden bg-slate-800/50 border border-white/5 shadow-2xl min-h-[75vh] flex items-center justify-center text-center px-4">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
              <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
              <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] mix-blend-screen animate-pulse"></div>

              <div className="relative z-10 max-w-4xl mx-auto py-20 flex flex-col items-center">
                <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white/5 text-blue-300 text-xs font-bold uppercase tracking-widest border border-white/10 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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

                <div className="flex gap-4">
                  <button onClick={openModal} className="btn btn-lg bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-2xl px-12 font-bold shadow-xl shadow-blue-900/50 hover:scale-105 transition-all">
                    Get Started for Free
                  </button>
                  <button
                    onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="btn btn-lg btn-ghost border border-white/10 text-white hover:bg-white/5 rounded-2xl px-8"
                  >
                    About Project
                  </button>
                </div>

                {/* TRUSTED BY STRIP */}
                <div className="mt-16 pt-8 border-t border-white/5 w-full">
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-6">Trusted by leading institutions</p>
                  <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {['IIT Madras', 'Stanford', 'MIT', 'BITS Pilani', 'Algorand Foundation'].map((name) => (
                      <span key={name} className="text-xl font-bold text-white/40 hover:text-white cursor-default">{name}</span>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* LIVE STATS TICKER */}
            <div className="w-full bg-blue-900/10 border-y border-white/5 backdrop-blur-md py-6">
              <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-around text-center gap-8">
                {[
                  { label: 'Verified Credentials', val: '14,203+' },
                  { label: 'Partner Universities', val: '50+' },
                  { label: 'Network Uptime', val: '100%' },
                  { label: 'Transaction Cost', val: '<$0.001' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-black text-white mb-1">{stat.val}</div>
                    <div className="text-blue-400 text-xs font-bold uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── ABOUT SECTION (New) ─────────────────────────── */}
            <div id="about-section" className="max-w-5xl mx-auto py-32 px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Why ScholarSBT?</h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  Traditional paper certificates are easily forged and hard to verify.
                  We use the <strong>Algorand Blockchain</strong> to create immutable, permanent proof of your achievements.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: '🔒', title: 'Tamper Proof', desc: 'Once minted, your credential lives on the blockchain forever. No one can delete or fake it.' },
                  { icon: '⚡', title: 'Instant Verify', desc: 'Employers can verify your skills in milliseconds using just your wallet address.' },
                  { icon: '🌍', title: 'Global Access', desc: 'Your academic history travels with you anywhere in the world, owned 100% by you.' }
                ].map((item, i) => (
                  <div key={i} className="bg-slate-800/30 p-8 rounded-3xl border border-white/5 hover:bg-slate-800/50 transition-colors">
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ) : (
        // ── DASHBOARD LAYOUT (Connected State) ───────────────────────────
        <div className="flex h-screen overflow-hidden bg-slate-900">
          {/* 1. Sidebar */}
          <div className="print:hidden">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* Main Content Shell */}
          <div className="flex-1 flex flex-col ml-64 print:ml-0 transition-all duration-300 relative">
            {/* 2. Header */}
            <div className="print:hidden">
              <DashboardHeader
                title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                activeAddress={activeAddress}
                openWalletModal={openModal}
              />
            </div>

            {/* 3. Main Scrollable Content */}
            <main className="flex-1 overflow-y-auto bg-slate-900 p-6 md:p-8 relative scroll-smooth no-scrollbar">

              {!appClient ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="loading loading-spinner loading-lg text-blue-500"></span>
                  <p className="mt-4 text-slate-400 animate-pulse">Syncing with Algorand...</p>
                </div>
              ) : (
                <div className="animate-fade-in max-w-7xl mx-auto pb-20">
                  {/* 
                      Switch Views based on sidebar selection 
                      Pass 'view' prop to StudentPanel to control section rendering
                   */}
                  {['dashboard', 'watch', 'leaderboard', 'settings'].includes(activeTab) && (
                    <StudentPanel
                      appClient={appClient}
                      activeAddress={activeAddress}
                      view={activeTab}
                    />
                  )}

                  {activeTab === 'verify' && (
                    <VerifyPage activeAddress={activeAddress} />
                  )}

                  {activeTab === 'admin' && (
                    <AdminPanel appClient={appClient} adminAddress={adminAddress} activeAddress={activeAddress} />
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
