import { memo } from 'react'

interface SidebarProps {
    activeTab: string
    setActiveTab: (tab: string) => void
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <IconHome /> },
        { id: 'watch', label: 'Watch & Earn', icon: <IconPlay /> },
        { id: 'verify', label: 'Verification', icon: <IconBadge /> },
        { id: 'leaderboard', label: 'Leaderboard', icon: <IconTrophy /> },
        { id: 'settings', label: 'Settings', icon: <IconSettings /> },
    ]

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-white/5 flex flex-col z-50">
            {/* ── Logo ───────────────────────────────────────────────────────── */}
            <div className="h-20 flex items-center px-8 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20">
                        S
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">
                        Scholar<span className="text-blue-400">SBT</span>
                    </span>
                </div>
            </div>

            {/* ── Menu ───────────────────────────────────────────────────────── */}
            <nav className="flex-1 py-8 px-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative
                ${isActive
                                    ? 'bg-blue-600/10 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)] border border-blue-500/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                                }`}
                        >
                            <span className={`transition-transform duration-300 ${isActive ? 'scale-110 text-blue-400' : 'group-hover:scale-110'}`}>
                                {item.icon}
                            </span>
                            <span className={`font-semibold tracking-wide ${isActive ? 'text-white' : ''}`}>
                                {item.label}
                            </span>

                            {isActive && (
                                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_currentColor] animate-pulse"></div>
                            )}
                        </button>
                    )
                })}
            </nav>

            {/* ── Footer ─────────────────────────────────────────────────────── */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={() => setActiveTab('settings')}
                    className="w-full bg-slate-800/50 rounded-xl p-4 border border-white/5 backdrop-blur-sm hover:bg-slate-700/50 hover:border-blue-500/30 transition-all text-left group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner group-hover:scale-105 transition-transform">
                            US
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white text-sm font-bold group-hover:text-blue-200 transition-colors">User</span>
                            <span className="text-slate-500 text-xs group-hover:text-slate-400">Student Plan</span>
                        </div>
                    </div>
                </button>
            </div>
        </aside>
    )
}

// ── Icons ─────────────────────────────────────────────────────────────
const IconHome = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
)
const IconPlay = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
)
const IconBadge = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
)
const IconTrophy = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8m-4-9v9m-8-3h16M17 7v1a3 3 0 0 0 6 0V7H1zM7 7v1a3 3 0 0 1-6 0V7h6z"></path></svg>
)
const IconSettings = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
)

export default memo(Sidebar)
