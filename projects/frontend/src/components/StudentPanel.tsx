import { useState, useEffect, useRef, memo } from 'react'
import { ScholarSbtClient } from '../contracts/ScholarSBTClient'
import { useSnackbar } from 'notistack'

interface StudentPanelProps {
    appClient: ScholarSbtClient
    activeAddress: string
    view?: string
}

const COURSES = [
    {
        id: 1,
        title: 'JEE Advanced: Mathematics',
        description: 'Calculus, Algebra & Coordinate Geometry. Complete this module to earn a tamper-proof JEE Math credential.',
        duration: '48 Hours',
        badge: '📐',
        level: 'Advanced',
        tier: 'Gold',
        color: 'from-yellow-600 to-yellow-400',
        youtubeId: 'WsQQvHm4lSw',
    },
    {
        id: 2,
        title: 'NEET: Biology & Organic Chemistry',
        description: 'Cell Biology, Genetics, Human Physiology — complete NEET prep module with blockchain-verified certificate.',
        duration: '52 Hours',
        badge: '🧬',
        level: 'Advanced',
        tier: 'Silver',
        color: 'from-slate-400 to-slate-200',
        youtubeId: 'URUJD5NEXC8',
    },
    {
        id: 3,
        title: 'Class 12 Physics: Mechanics & Waves',
        description: 'Kinematics, Laws of Motion, SHM, Waves, and Optics — board + entrance exam level.',
        duration: '40 Hours',
        badge: '⚛️',
        level: 'Intermediate',
        tier: 'Bronze',
        color: 'from-orange-700 to-orange-400',
        youtubeId: 'ZM8ECpBuQYE',
    },
    {
        id: 4,
        title: 'Data Structures & Algorithms (Masterclass)',
        description: 'Arrays, Trees, Graphs, Dynamic Programming — Premium content for top placements.',
        duration: '60 Hours',
        badge: '💻',
        level: 'Masterclass',
        tier: 'Platinum',
        color: 'from-slate-800 to-slate-600',
        youtubeId: 'HtSuA80QTyo',
        price: 50, // Token Gated
    },
]

const StudentPanel: React.FC<StudentPanelProps> = ({ appClient, activeAddress, view = 'dashboard' }) => {
    const [myBadges, setMyBadges] = useState<bigint[]>([])
    const [claiming, setClaiming] = useState<number | null>(null)
    const [openVideo, setOpenVideo] = useState<string | null>(null)
    const [txIds, setTxIds] = useState<Record<number, string>>({})
    const [completedModules, setCompletedModules] = useState<number[]>([])
    const [watchedModules, setWatchedModules] = useState<number[]>([]) // proof of watch
    const [unlockedCourses, setUnlockedCourses] = useState<number[]>([]) // token gated content

    // Gamification State
    const [coins, setCoins] = useState(0)
    const [streak, setStreak] = useState(0)

    // Demo Mode State (Forced True Logic)
    const [demoMode] = useState(() => {
        const saved = localStorage.getItem('scholar_demo_mode_v2')
        if (saved === null) {
            localStorage.setItem('scholar_demo_mode_v2', 'true')
            return true
        }
        return saved === 'true'
    })

    const { enqueueSnackbar } = useSnackbar()

    // ── Load Data ─────────────────────────────────────────────────────────
    const fetchBadges = async () => {
        try {
            if (demoMode) {
                // Mock Data for Demo
                const mockBadges = JSON.parse(localStorage.getItem(`scholar_badges_${activeAddress}`) || '[]')
                setMyBadges(mockBadges.map((b: string) => BigInt(b)))
            } else {
                // Real Blockchain Call
                // Real Blockchain Call
                // const state = await appClient.getBoxValueFromMap(activeAddress)
                // Parsing logic simplified for brevity/stability
                // In real app we parse the box map
            }
        } catch (e) {
            console.warn('Error fetching badges:', e)
        }
    }

    useEffect(() => {
        fetchBadges()
        // Load coins/streak/completed from local storage for demo
        const storedCoins = localStorage.getItem(`scholar_coins_${activeAddress}`)
        if (storedCoins) setCoins(parseInt(storedCoins))

        const storedCompleted = localStorage.getItem(`scholar_completed_${activeAddress}`)
        if (storedCompleted) setCompletedModules(JSON.parse(storedCompleted))

        const storedUnlocked = localStorage.getItem(`scholar_unlocked_${activeAddress}`)
        if (storedUnlocked) {
            try {
                const parsed = JSON.parse(storedUnlocked)
                if (Array.isArray(parsed)) setUnlockedCourses(parsed)
                else setUnlockedCourses([])
            } catch { setUnlockedCourses([]) }
        }
    }, [activeAddress, demoMode, view])

    // Load watched modules from localStorage
    useEffect(() => {
        const savedWatched = localStorage.getItem(`scholar_watched_${activeAddress}`)
        if (savedWatched) {
            try {
                const parsed = JSON.parse(savedWatched)
                if (Array.isArray(parsed)) {
                    setWatchedModules(parsed)
                } else {
                    setWatchedModules([]) // Reset if data is corrupted
                }
            } catch (e) {
                console.error("Error loading watched modules", e)
                setWatchedModules([])
            }
        }
    }, [activeAddress])

    useEffect(() => {
        if (activeAddress && watchedModules.length > 0) {
            localStorage.setItem(`scholar_watched_${activeAddress}`, JSON.stringify(watchedModules))
        }
    }, [watchedModules, activeAddress])

    // ── Leaderboard Data (Mock) ───────────────────────────────────────────
    const MOCK_LEADERBOARD = [
        { rank: 1, address: 'H7...2X', coins: 2450, badges: 15, tier: 'Gold' },
        { rank: 2, address: 'A9...9P', coins: 1980, badges: 12, tier: 'Silver' },
        { rank: 3, address: 'X2...4M', coins: 1650, badges: 10, tier: 'Bronze' },
    ]

    // ── Proof of Watch Logic ──────────────────────────────────────────────
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        if (openVideo) {
            const course = COURSES.find(c => c.youtubeId === openVideo)
            if (course && !watchedModules.includes(course.id)) {
                timer = setTimeout(() => {
                    setWatchedModules(prev => [...prev, course.id])
                    enqueueSnackbar(`✅ Module "${course.title}" Completed! Reward Unlocked.`, { variant: 'success' })
                }, 5000) // 5s demo timer
            }
        }

        return () => {
            if (timer) clearTimeout(timer)
        }
    }, [openVideo, watchedModules, enqueueSnackbar])

    // ── Actions ───────────────────────────────────────────────────────────
    const handleClaim = async (courseId: number) => {
        setClaiming(courseId)
        try {
            if (demoMode) {
                await new Promise(r => setTimeout(r, 2000)) // Sim delay
                const newBadges = [...myBadges, BigInt(courseId)]
                setMyBadges(newBadges)
                localStorage.setItem(`scholar_badges_${activeAddress}`, JSON.stringify(newBadges.map(b => b.toString())))
                // GLOBAL FALLBACK FOR DEMO (Fixes sync issues)
                localStorage.setItem('scholar_demo_fallback_badges', JSON.stringify(newBadges.map(b => b.toString())))

                setTxIds(prev => ({ ...prev, [courseId]: 'TX-SIM-TESTNET-' + Math.random().toString(36).substring(7) }))
                setTxIds(prev => ({ ...prev, [courseId]: 'TX-SIM-TESTNET-' + Math.random().toString(36).substring(7) }))

                // Fix: Update Coins
                const newCoins = coins + 50
                setCoins(newCoins)
                localStorage.setItem(`scholar_coins_${activeAddress}`, String(newCoins))
                enqueueSnackbar(`🎉 Certificate minted! +50 Coins earned!`, { variant: 'success' })
            }
        } catch (e) {
            enqueueSnackbar('Claim failed', { variant: 'error' })
        } finally {
            setClaiming(null)
        }
    }

    const handleUnlock = (courseId: number, price: number) => {
        if (coins >= price) {
            const newCoins = coins - price
            setCoins(newCoins)
            localStorage.setItem(`scholar_coins_${activeAddress}`, String(newCoins))

            const newUnlocked = [...unlockedCourses, courseId]
            setUnlockedCourses(newUnlocked)
            localStorage.setItem(`scholar_unlocked_${activeAddress}`, JSON.stringify(newUnlocked))

            enqueueSnackbar(`🔓 Masterclass Unlocked! -${price} Coins`, { variant: 'success' })
        } else {
            enqueueSnackbar(`❌ Insufficient Coins! You need ${price} Coins. Watch other modules to earn!`, { variant: 'error' })
        }
    }

    // ── Views ─────────────────────────────────────────────────────────────

    // 1. Dashboard View
    if (view === 'dashboard') {
        const nextCourse = COURSES.find(c => !myBadges.includes(BigInt(c.id))) || COURSES[0]
        const recentBadges = [...myBadges].reverse().slice(0, 3)

        return (
            <div className="space-y-8 animate-fade-in relative z-10 block">
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard label="Total SBTs Earned" value={myBadges.length.toString()} icon={<IconBadge />} color="blue" />
                    <MetricCard label="PW-Coins Balance" value={coins.toString()} icon={<IconCoin />} color="yellow" />
                    <MetricCard label="Global Rank" value="#42" icon={<IconTrophy />} color="purple" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active Course */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-9xl">{nextCourse.badge}</span>
                            </div>
                            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Active Course</h3>
                            <h2 className="text-3xl font-black text-white mb-4">{nextCourse.title}</h2>
                            <p className="text-slate-400 mb-8 max-w-lg">{nextCourse.description}</p>

                            <div className="flex items-center gap-4">
                                <button onClick={() => setOpenVideo(nextCourse.youtubeId)} className="btn bg-white text-slate-900 border-0 hover:bg-blue-50 hover:text-blue-600 font-bold rounded-xl px-8 shadow-lg shadow-white/5">
                                    <IconPlay /> Continue Learning
                                </button>
                                <div className="text-sm font-mono text-slate-500">{nextCourse.duration} Remaining</div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Achievements */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-6">Recent Badges</h3>
                        <div className="space-y-4">
                            {recentBadges.length === 0 && <p className="text-slate-500 italic">No badges yet. Start learning!</p>}
                            {recentBadges.map((bid, i) => {
                                const c = COURSES.find(c => BigInt(c.id) === bid)
                                if (!c) return null
                                return (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                                        <div className="text-2xl">{c.badge}</div>
                                        <div>
                                            <div className="font-bold text-white text-sm">{c.title}</div>
                                            <div className="text-xs text-slate-500 mt-1">Minted Just Now</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* SBT Vault */}
                <div>
                    <h3 className="text-white text-xl font-bold mb-6 flex items-center gap-2">
                        <IconLock /> SBT Vault <span className="text-slate-500 text-sm font-normal">(Credentials)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {COURSES.map(course => {
                            const earned = myBadges.includes(BigInt(course.id))
                            return (
                                <div key={course.id} className={`relative p-6 rounded-3xl border border-white/10 transition-all duration-300 ${earned ? 'bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl shadow-blue-900/10' : 'bg-white/5 grayscale opacity-70 hover:opacity-100 hover:grayscale-0'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-4xl">{course.badge}</div>
                                        {earned ? (
                                            <div className="badge badge-success gap-1 font-bold text-xs"><IconCheck /> Verified</div>
                                        ) : (
                                            <div className="badge badge-ghost gap-1 text-xs"><IconLock /> Locked</div>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-white mb-1 leading-tight">{course.title}</h4>
                                    <p className="text-xs text-slate-400 mb-4">{course.tier} Tier credential</p>

                                    {earned && (
                                        <button onClick={() => window.open(`https://lora.algokit.io/testnet`, '_blank')} className="btn btn-xs btn-outline btn-info w-full">
                                            Verify On-Chain
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Video Modal (Global) */}
                {openVideo && (
                    <div className="modal modal-open bg-black/90 backdrop-blur-sm z-50">
                        <div className="modal-box w-11/12 max-w-5xl bg-black p-0 overflow-hidden relative aspect-video shadow-2xl shadow-blue-500/20">
                            <button className="btn btn-sm btn-circle absolute right-4 top-4 z-50 bg-black/50 border-white/10 text-white hover:bg-red-600" onClick={() => setOpenVideo(null)}>✕</button>
                            <iframe
                                className="w-full h-full"
                                src={`https://www.youtube-nocookie.com/embed/${openVideo}?autoplay=1`}
                                title="Video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // 2. Watch & Earn View
    if (view === 'watch') {
        return (
            <div className="space-y-6 animate-fade-in block">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-white">Course Library</h2>
                    <div className="badge badge-lg bg-blue-600 text-white border-0 font-bold">4 Modules Available</div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {COURSES.map(course => {
                        const isCompleted = completedModules.includes(course.id)
                        const hasBadge = myBadges.includes(BigInt(course.id))

                        return (
                            <div key={course.id} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-center">
                                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-5xl bg-gradient-to-br ${course.color} shadow-lg`}>
                                    {course.badge}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                        <h3 className="text-2xl font-bold text-white">{course.title}</h3>
                                        <span className={`badge border-0 font-bold ${course.level === 'Advanced' ? 'bg-red-500/20 text-red-300' : 'bg-orange-500/20 text-orange-300'}`}>{course.level}</span>
                                    </div>
                                    <p className="text-slate-400 mb-4">{course.description}</p>
                                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                        <button
                                            onClick={() => setOpenVideo(course.youtubeId)}
                                            className="btn bg-white text-slate-900 border-0 hover:bg-blue-50 font-bold rounded-xl px-6"
                                            disabled={(course as any).price && !unlockedCourses.includes(course.id)}
                                        >
                                            <IconPlay /> Watch Module
                                        </button>

                                        {(course as any).price && !unlockedCourses.includes(course.id) && (
                                            <button
                                                onClick={() => handleUnlock(course.id, (course as any).price)}
                                                className="btn btn-warning gap-2 rounded-xl px-6 font-bold"
                                            >
                                                <IconLock /> Unlock ({(course as any).price} 🟡)
                                            </button>
                                        )}

                                        {!hasBadge && !((course as any).price && !unlockedCourses.includes(course.id)) ? (
                                            <button
                                                onClick={() => handleClaim(course.id)}
                                                disabled={claiming === course.id || !watchedModules.includes(course.id)}
                                                className={`btn rounded-xl px-6 ${watchedModules.includes(course.id) ? 'btn-primary text-white' : 'btn-disabled opacity-50'}`}
                                            >
                                                {claiming === course.id ? 'Minting...' : watchedModules.includes(course.id) ? 'Claim Certificate' : 'Watch to Unlock'}
                                            </button>
                                        ) : (
                                            <div className="btn bg-green-500/10 border-green-500/50 text-green-400 rounded-xl px-6 no-animation cursor-default">
                                                <IconCheck /> Claimed
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {
                    openVideo && (
                        <div className="modal modal-open bg-black/90 backdrop-blur-sm z-50">
                            <div className="modal-box w-11/12 max-w-5xl bg-black p-0 overflow-hidden relative aspect-video shadow-2xl border border-white/10">
                                <button className="btn btn-sm btn-circle absolute right-4 top-4 z-50 bg-black/50 border-white/10 text-white hover:bg-red-600" onClick={() => setOpenVideo(null)}>✕</button>
                                <iframe
                                    className="w-full h-full"
                                    src={`https://www.youtube-nocookie.com/embed/${openVideo}?autoplay=1`}
                                    title="Video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    )
                }
            </div>
        )
    }



    // 3. Leaderboard View
    if (view === 'leaderboard') {
        return (
            <div className="space-y-6 animate-fade-in block">
                <h2 className="text-3xl font-black text-white mb-6">Global Leaderboard</h2>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                    <table className="table w-full">
                        <thead>
                            <tr className="text-slate-400 border-b border-white/10">
                                <th className="bg-transparent">Rank</th>
                                <th className="bg-transparent">Scholar</th>
                                <th className="bg-transparent">Coins</th>
                                <th className="bg-transparent text-right">Credentials</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_LEADERBOARD.map((user) => (
                                <tr key={user.rank} className="hover:bg-white/5 transition-colors border-b border-white/5">
                                    <td className="font-bold text-xl text-white">#{user.rank}</td>
                                    <td className="font-mono text-slate-300">{user.address}</td>
                                    <td className="font-bold text-yellow-400">{user.coins} 🟡</td>
                                    <td className="text-right font-bold text-white">{user.badges} SBTs</td>
                                </tr>
                            ))}
                            {/* Current User */}
                            <tr className="bg-blue-500/20 border-l-4 border-blue-500">
                                <td className="font-bold text-xl text-white">#{42}</td>
                                <td className="font-bold text-white flex items-center gap-2">
                                    You
                                    <span className="badge badge-sm badge-info">STUDENT</span>
                                </td>
                                <td className="font-bold text-yellow-400">{coins} 🟡</td>
                                <td className="text-right font-bold text-white">{myBadges.length} SBTs</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    // 4. Settings View
    if (view === 'settings') {
        const resetData = () => {
            if (confirm('Reset all demo progress?')) {
                localStorage.clear()
                window.location.reload()
            }
        }
        return (
            <div className="space-y-8 animate-fade-in block">
                <h2 className="text-3xl font-black text-white">Settings</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Blockchain Network */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                        <h3 className="text-xl font-bold text-white mb-4">Blockchain Network</h3>
                        <div className="form-control">
                            <label className="label cursor-pointer justify-start gap-4">
                                <input type="radio" name="net" className="radio radio-primary" checked readOnly />
                                <span className="label-text text-white">Algorand Testnet (Active)</span>
                            </label>
                        </div>
                        <div className="mt-4 p-4 bg-black/30 rounded-xl border border-white/5">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Contract Address</div>
                            <div className="font-mono text-slate-300 break-all text-sm">{import.meta.env.VITE_SCHOLAR_SBT_APP_ID || '755768739'}</div>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                        <h3 className="text-xl font-bold text-white mb-4">Data Management</h3>
                        <p className="text-slate-400 mb-6">Clear your local progress and start fresh. This does not affect on-chain assets.</p>
                        <button onClick={resetData} className="btn btn-error btn-outline w-full">
                            Reset Demo Data
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return <div className="text-slate-500">View not implemented: {view}</div>
}

// ── Helpers ───────────────────────────────────────────────────────────
const MetricCard = ({ label, value, icon, color }: any) => (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-default group">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-${color}-500/10 text-${color}-400 group-hover:bg-${color}-500/20 transition-colors`}>
            {icon}
        </div>
        <div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</div>
            <div className="text-3xl font-black text-white">{value}</div>
        </div>
    </div>
)

const StudentPanelMemo = memo(StudentPanel)

// ── Icons ─────────────────────────────────────────────────────────────
const IconBadge = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
const IconCoin = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path></svg>
const IconTrophy = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8m-4-9v9m-8-3h16M17 7v1a3 3 0 0 0 6 0V7H1zM7 7v1a3 3 0 0 1-6 0V7h6z"></path></svg>
const IconPlay = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
const IconLock = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>

export default StudentPanelMemo
