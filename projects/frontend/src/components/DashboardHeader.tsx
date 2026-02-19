import { memo, useState, useEffect } from 'react'

interface DashboardHeaderProps {
    title: string
    activeAddress: string | null
    openWalletModal: () => void
}

const DashboardHeader = ({ title, activeAddress, openWalletModal }: DashboardHeaderProps) => {
    const [showNotifs, setShowNotifs] = useState(false)
    const [notifications, setNotifications] = useState<{ title: string, msg: string, type: string }[]>([])

    // Load Real Notifications from Use History
    useEffect(() => {
        if (!activeAddress) return

        const refreshNotifs = () => {
            const watched = JSON.parse(localStorage.getItem(`scholar_watched_${activeAddress}`) || '[]')
            const badges = JSON.parse(localStorage.getItem(`scholar_badges_${activeAddress}`) || '[]')

            const realNotifs = []

            // System Welcome
            realNotifs.push({ title: '🚀 System Online', msg: 'Welcome to ScholarSBT on Algorand Testnet.', type: 'info' })

            // Badges
            if (badges.length > 0) {
                realNotifs.push({
                    title: '🎓 Certified Scholar',
                    msg: `You have earned ${badges.length} Verified Credentials on-chain!`,
                    type: 'success'
                })
            }

            // Watched Modules
            watched.forEach((id: number) => {
                realNotifs.push({
                    title: '📺 Module Completed',
                    msg: `You finished a learning module. Claim your certificate now!`,
                    type: 'action'
                })
            })

            setNotifications(realNotifs.reverse())
        }

        refreshNotifs()
        // Refresh every time we open the dropdown
        if (showNotifs) refreshNotifs()

    }, [activeAddress, showNotifs])

    return (
        <header className="h-20 flex items-center justify-between px-8 bg-slate-900/80 border-b border-white/5 sticky top-0 z-40 backdrop-blur-md">
            {/* ── Breadcrumbs ────────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="hover:text-blue-400 cursor-pointer transition-colors">Home</span>
                <span>/</span>
                <span className="text-white font-semibold transition-all animate-fade-in">{title}</span>
            </div>

            {/* ── Right Actions ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-6">
                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifs(!showNotifs)}
                        // onBlur={() => setTimeout(() => setShowNotifs(false), 200)} // Disable blur to allow clicking inside
                        className="relative p-2.5 text-slate-400 hover:text-white transition-all rounded-full hover:bg-white/5 group"
                    >
                        <IconBell />
                        {notifications.length > 0 && <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border border-slate-900 group-hover:animate-ping"></span>}
                        {notifications.length > 0 && <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>}
                    </button>

                    {showNotifs && (
                        <div className="absolute top-12 right-0 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 animate-fade-in z-50">
                            <h3 className="text-white font-bold mb-3 flex items-center justify-between">
                                Notifications <span className="text-xs text-blue-400 cursor-pointer" onClick={() => setShowNotifs(false)}>Close</span>
                            </h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="text-slate-500 text-sm p-2">No new notifications</div>
                                ) : (
                                    notifications.map((n, i) => (
                                        <div key={i} className={`p-3 rounded-xl border transition-colors cursor-pointer ${n.type === 'success' ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                            <div className={`text-sm font-bold mb-1 ${n.type === 'success' ? 'text-green-400' : 'text-white'}`}>{n.title}</div>
                                            <div className="text-xs text-slate-400">{n.msg}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-white/10"></div>

                {/* Wallet Button */}
                <button
                    onClick={openWalletModal}
                    className={`flex items-center gap-3 px-5 py-2.5 rounded-full font-bold transition-all duration-300 border ${activeAddress
                        ? 'bg-slate-800 border-white/10 text-white hover:bg-slate-700 hover:border-white/20'
                        : 'bg-gradient-to-r from-blue-600 to-blue-500 border-transparent text-white hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105'
                        }`}
                >
                    {activeAddress ? (
                        <>
                            <div className="relative flex items-center justify-center w-3 h-3">
                                <div className="absolute w-full h-full bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                                <div className="relative w-2 h-2 bg-emerald-500 rounded-full"></div>
                            </div>
                            <span className="font-mono text-sm tracking-wide text-slate-200">
                                {activeAddress.slice(0, 4)}...{activeAddress.slice(-4)}
                            </span>
                        </>
                    ) : (
                        <>
                            <IconWallet />
                            <span>Connect Wallet</span>
                        </>
                    )}
                </button>
            </div>
        </header>
    )
}

// ── Icons ─────────────────────────────────────────────────────────────
const IconBell = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
)
const IconWallet = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
)

export default memo(DashboardHeader)
