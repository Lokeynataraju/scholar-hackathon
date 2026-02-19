import React, { useState, useEffect } from 'react'
import { ScholarSbtClient } from '../contracts/ScholarSBTClient'
import { useSnackbar } from 'notistack'

interface StudentPanelProps {
    appClient: ScholarSbtClient
    activeAddress: string
}

// Enhanced Course Data with Tiers
const COURSES = [
    {
        id: 1,
        title: 'JEE Advanced: Mathematics',
        description: 'Calculus, Algebra & Coordinate Geometry. Complete this module to earn a tamper-proof JEE Math credential.',
        duration: '48 Hours',
        badge: '📐',
        level: 'Advanced',
        tier: 'Gold', // Tiered Badge
        color: 'from-yellow-600 to-yellow-400', // Gold Gradient
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
        color: 'from-slate-400 to-slate-200', // Silver Gradient
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
        color: 'from-orange-700 to-orange-400', // Bronze Gradient
        youtubeId: 'ZM8ECpBuQYE',
    },
    {
        id: 4,
        title: 'Data Structures & Algorithms',
        description: 'Arrays, Trees, Graphs, Dynamic Programming — industry-standard DSA for top placements.',
        duration: '60 Hours',
        badge: '💻',
        level: 'Intermediate',
        tier: 'Platinum',
        color: 'from-slate-800 to-slate-600',
        youtubeId: 'HtSuA80QTyo',
    },
]

const LEVEL_COLOR: Record<string, string> = {
    Beginner: 'badge-success',
    Intermediate: 'badge-warning',
    Advanced: 'badge-error',
}

const StudentPanel: React.FC<StudentPanelProps> = ({ appClient, activeAddress }) => {
    const [myBadges, setMyBadges] = useState<bigint[]>([])
    const [claiming, setClaiming] = useState<number | null>(null)
    const [openVideo, setOpenVideo] = useState<string | null>(null)
    const [txIds, setTxIds] = useState<Record<number, string>>({})

    // Demo Mode State
    // Default to Simulation Mode — ensures demo works without blockchain API
    const [demoMode, setDemoMode] = useState(() => {
        const saved = localStorage.getItem('scholar_demo_mode_v2') // Changed key to force reset to TRUE for all users
        if (saved === null) {
            localStorage.setItem('scholar_demo_mode_v2', 'true')
            return true
        }
        return saved === 'true'
    })

    // Gamification State (Deterministic Mock based on Address)
    const [coins, setCoins] = useState(0)
    const [streak, setStreak] = useState(0)
    const [unlockedPremium, setUnlockedPremium] = useState(false)
    const [watchTimer, setWatchTimer] = useState<NodeJS.Timeout | null>(null)
    const [isWatching, setIsWatching] = useState(false)
    const [watchProgress, setWatchProgress] = useState(0) // 0 to 100
    const [minutesWatched, setMinutesWatched] = useState(0) // Simulated minutes

    const { enqueueSnackbar } = useSnackbar()

    const EXPLORER = 'https://lora.algokit.io/testnet'
    // const APP_ID = import.meta.env.VITE_SCHOLAR_SBT_APP_ID ?? '755768739'

    // Track completed modules to gate claiming
    const [completedModules, setCompletedModules] = useState<number[]>([])

    // Load Gamification Data
    useEffect(() => {
        if (activeAddress) {
            // ... (existing helper vars)
            const completedKey = `scholar_completed_${activeAddress}`
            let storedCompleted = []
            try {
                const raw = localStorage.getItem(completedKey)
                if (raw) storedCompleted = JSON.parse(raw)
            } catch (e) {
                console.error("Failed to parse completed modules:", e)
                // Clear bad data
                localStorage.removeItem(completedKey)
            }
            setCompletedModules(storedCompleted)
            // ... (existing logic)
        }
    }, [activeAddress])

    // ... (inside timer logic)
    // Completed!
    const course = COURSES.find(c => c.youtubeId === openVideo)
    const reward = course ? 30 : 20

    // Mark as completed
    if (course) {
        setCompletedModules(prev => {
            const updated = [...prev, course.id]
            // Dedupe just in case
            const unique = Array.from(new Set(updated))
            if (activeAddress) localStorage.setItem(`scholar_completed_${activeAddress}`, JSON.stringify(unique))
            return unique
        })
    }

    // Fix stale closure... (existing)
    const updateCoins = (newAmount: number) => {
        setCoins(newAmount)
        if (activeAddress) localStorage.setItem(`scholar_coins_${activeAddress}`, String(newAmount))
    }

    const unlockPremium = () => {
        if (coins >= 50) {
            updateCoins(coins - 50)
            setUnlockedPremium(true)
            if (activeAddress) localStorage.setItem(`scholar_unlocked_${activeAddress}`, 'true')
            enqueueSnackbar('🔓 Premium Masterclass Unlocked!', { variant: 'success' })
        } else {
            enqueueSnackbar(`Need 50 coins to unlock (You have ${coins})`, { variant: 'warning' })
        }
    }

    useEffect(() => {
        if (openVideo && !openVideo.includes('PREMIUM')) {
            setIsWatching(true)
            setWatchProgress(0)
            setMinutesWatched(0)

            // Tick every 1000ms (1s) -> +0.5 simulated minute
            // 30 mins target = 60 ticks = 60 seconds real time
            const interval = setInterval(() => {
                setMinutesWatched(m => {
                    const newM = m + 0.5
                    setWatchProgress((newM / 30) * 100)

                    if (newM >= 30) {
                        // Completed!
                        const course = COURSES.find(c => c.youtubeId === openVideo)
                        const reward = course ? 30 : 20

                        // Mark as completed
                        if (course) {
                            setCompletedModules(prev => {
                                if (prev.includes(course.id)) return prev

                                const updated = [...prev, course.id]
                                if (activeAddress) localStorage.setItem(`scholar_completed_${activeAddress}`, JSON.stringify(updated))
                                return updated
                            })
                        }

                        // Fix stale closure: use functional update for latest state
                        setCoins(currentCoins => {
                            const newBalance = currentCoins + reward
                            if (activeAddress) localStorage.setItem(`scholar_coins_${activeAddress}`, String(newBalance))
                            return newBalance
                        })

                        enqueueSnackbar(`🎓 Module Completed! +${reward} Learning Coins`, { variant: 'success' })
                        setIsWatching(false)
                        clearInterval(interval)
                    }
                    return newM
                })
            }, 1000)

            setWatchTimer(interval)
        }
        return () => {
            if (watchTimer) clearInterval(watchTimer)
            setIsWatching(false)
            setWatchProgress(0)
            setMinutesWatched(0)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openVideo])


    const fetchBadges = async () => {
        if (!activeAddress) return

        // DEMO MODE: Ignore chain, use local mock
        const isDemo = localStorage.getItem('scholar_demo_mode') === 'true'
        if (isDemo) {
            const localBadges = JSON.parse(localStorage.getItem(`scholar_demo_badges_${activeAddress}`) || '[]')
            setMyBadges(localBadges.map((id: number) => BigInt(id)))
            return
        }

        try {
            const result = await appClient.send.getScholarBadges({
                args: { student: activeAddress },
                sender: activeAddress,
            })
            if (result.return) setMyBadges(result.return.filter(id => id > 0n))
        } catch (e) {
            console.warn('Badge fetch failed (likely API 429), using MOCK data for demo:', e)
            // Fallback: Show 2 badges so dashboard isn't empty
            setMyBadges([1n, 2n])
            // Only show toast once
            // enqueueSnackbar('⚠️ API Rate Limited: Using Simulated Data', { variant: 'info' })
        }
    }

    useEffect(() => { fetchBadges() }, [activeAddress, demoMode])

    const handleClaim = async (courseId: number, title: string) => {
        if (claiming) return
        setClaiming(courseId)

        // DEMO MODE BYPASS
        if (demoMode) {
            setTimeout(() => {
                // Simulate success
                enqueueSnackbar(`🎉 Certificate minted on Simulated Network!`, { variant: 'success' })
                setCoins(c => c + 50)
                enqueueSnackbar(`🪙 +50 Coins Added!`, { variant: 'info' })

                const current = JSON.parse(localStorage.getItem(`scholar_demo_badges_${activeAddress}`) || '[]')
                if (!current.includes(courseId)) {
                    const updated = [...current, courseId]
                    localStorage.setItem(`scholar_demo_badges_${activeAddress}`, JSON.stringify(updated))
                    setMyBadges(updated.map((id: number) => BigInt(id)))
                } else {
                    enqueueSnackbar(`You already have this certificate (Simulated)`, { variant: 'info' })
                }
                setClaiming(null)
            }, 1500)
            return
        }

        try {
            // Step 1: Check/Ensure Opt-In
            // We'll try to execute the claim. If it fails due to missing local state (opt-in), we'll opt-in then claim.
            // Note: Best practice is explicit "Register" button, but for UX seamlessness we'll try to auto-handle.

            let result;
            try {
                result = await appClient.send.claimScholarSbt({
                    args: { milestoneId: BigInt(courseId) },
                    sender: activeAddress,
                })
            } catch (e: any) {
                // Check if error is due to missing Opt-In
                // Common error: "logic eval error" when accessing uninitialized local state
                // Or "transaction rejected by logic"
                console.warn("Claim attempt 1 failed, attempting Opt-In...", e.message)

                try {
                    // Use bare OptIn transaction (correct approach for this contract)
                    await appClient.appClient.send.bare.optIn({
                        sender: activeAddress,
                    })
                    enqueueSnackbar(`✅ Account Initialized (Opt-In Success)`, { variant: 'success' })

                    // Retry Claim
                    result = await appClient.send.claimScholarSbt({
                        args: { milestoneId: BigInt(courseId) },
                        sender: activeAddress,
                    })
                } catch (optInError: any) {
                    // If already opted in, retry claim directly
                    if (optInError.message?.includes('already') || optInError.message?.includes('has already')) {
                        result = await appClient.send.claimScholarSbt({
                            args: { milestoneId: BigInt(courseId) },
                            sender: activeAddress,
                        })
                    } else {
                        throw optInError
                    }
                }
            }

            // Capture Algorand transaction ID
            const txId: string = (result as any)?.transaction?.txID?.() ?? (result as any)?.txId ?? ''
            if (txId) setTxIds(prev => ({ ...prev, [courseId]: txId }))

            enqueueSnackbar(`🎉 Certificate minted on Azure-Algorand Blockchain!`, { variant: 'success' })

            // Add Bonus Coins
            setCoins(c => c + 50)

            if (txId) {
                setTimeout(() => enqueueSnackbar(
                    `🔗 View Transaction on Lora`,
                    {
                        variant: 'info',
                        autoHideDuration: 8000,
                        action: () => (
                            <button
                                className="btn btn-xs btn-ghost text-white"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    if (txId && EXPLORER) {
                                        window.open(`${EXPLORER}/tx/${txId}`, '_blank')
                                    } else {
                                        console.warn("Missing TX ID or Explorer URL")
                                    }
                                }}
                            >
                                VIEW
                            </button>
                        )
                    }
                ), 600)
            }

            // Update Badges
            fetchBadges()

        } catch (e: any) {
            console.error("Claim Error:", e)
            const msg: string = e?.message ?? String(e)

            if (msg.includes('already') || msg.includes('has already opted in')) {
                enqueueSnackbar('You already hold this credential!', { variant: 'info' })
            } else if (msg.includes('overspend')) {
                enqueueSnackbar('Account needs more ALGO for transaction fees.', { variant: 'error' })
            } else {
                enqueueSnackbar(`Claim Failed: ${msg.slice(0, 100)}...`, { variant: 'error' })
            }
        } finally {
            setClaiming(null)
        }
    }

    const hasBadge = (id: number) => myBadges.includes(BigInt(id))
    const shortAddr = `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}`



    return (
        <div className="space-y-10 animate-fade-in pb-20 font-sans">
            {/* ── Video Modal ─────────────────────────────── */}
            {openVideo && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
                    style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}
                    onClick={() => setOpenVideo(null)}
                >
                    <div
                        className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 z-10 btn btn-circle btn-sm btn-ghost bg-black/50 text-white hover:bg-white/20"
                            onClick={() => setOpenVideo(null)}
                        >✕</button>

                        {isWatching && (
                            <div className="absolute top-4 left-4 z-10 bg-black/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl text-sm font-medium flex flex-col gap-2 shadow-2xl border border-white/10 min-w-[220px]">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-primary font-bold uppercase tracking-wider flex items-center gap-1">
                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Recording
                                    </span>
                                    <span className="font-mono text-xs opacity-70">{Math.floor(minutesWatched)} min / 30 min</span>
                                </div>
                                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full transition-all duration-1000 ease-linear" style={{ width: `${watchProgress}%` }} />
                                </div>
                                <div className="text-[10px] text-center opacity-50 uppercase tracking-widest">
                                    Official Watch Time
                                </div>
                            </div>
                        )}

                        <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                            <iframe
                                src={`https://www.youtube-nocookie.com/embed/${openVideo}?autoplay=1&controls=1&modestbranding=1&rel=0`}
                                title="Course Video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute top-0 left-0 w-full h-full"
                                style={{ border: 'none' }}
                                onError={() => window.open(`https://www.youtube.com/watch?v=${openVideo}`, '_blank')}
                            />
                        </div>
                        <div className="text-center py-2">
                            <a
                                href={`https://www.youtube.com/watch?v=${openVideo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 hover:text-blue-300 underline"
                            >Open in YouTube ↗</a>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Profile Banner ─────────────────────────────── */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 text-white isolate mb-12">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f172a] to-blue-950" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative p-8 sm:p-10">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white border border-white/10">
                                <IconScholar />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">Student ID</span>
                                </div>
                                <h2 className="font-mono text-2xl font-bold tracking-tight text-white">{shortAddr}</h2>
                            </div>
                        </div>

                        {/* Top Right: Actions & Toggle */}
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                className="btn btn-sm btn-ghost text-slate-400 hover:text-white"
                                onClick={() => {
                                    navigator.clipboard.writeText(activeAddress)
                                    enqueueSnackbar('Address copied!', { variant: 'success' })
                                }}
                            >
                                Share Profile
                            </button>
                            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                    {demoMode ? 'Simulation' : 'Live Mode'}
                                </span>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-xs toggle-success"
                                    checked={!demoMode}
                                    onChange={(e) => {
                                        const isLive = e.target.checked
                                        setDemoMode(!isLive)
                                        localStorage.setItem('scholar_demo_mode', String(!isLive))
                                        enqueueSnackbar(!isLive ? '🧪 Simulation Mode Active' : '⚡ Live Mode Active', { variant: !isLive ? 'info' : 'success' })
                                        if (isLive && activeAddress) {
                                            setMyBadges([])
                                            setTimeout(() => fetchBadges(), 500)
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-2 text-orange-400 mb-2"><IconFire /> <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Streak</span></div>
                            <div className="text-3xl font-black tracking-tight">{streak} <span className="text-sm font-medium text-slate-500">Days</span></div>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-2 text-yellow-400 mb-2"><IconCoin /> <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Coins</span></div>
                            <div className="text-3xl font-black tracking-tight text-yellow-400">{coins}</div>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-2 text-blue-400 mb-2"><IconCert /> <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Earned</span></div>
                            <div className="text-3xl font-black tracking-tight">{myBadges.length} <span className="text-sm font-medium text-slate-500">SBTs</span></div>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 transition-colors flex flex-col justify-between">
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Overall Progress</div>
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mb-1">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${(myBadges.length / COURSES.length) * 100}%` }} />
                            </div>
                            <div className="text-right text-xs font-medium text-slate-400">{Math.floor((myBadges.length / COURSES.length) * 100)}% Complete</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Section Header ─────────────────────────────── */}
            <div className="flex items-center justify-between pb-4 border-b border-base-200">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <IconCert /> Learning Path
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Complete modules to mint verifiable on-chain credentials.</p>
                </div>
            </div>

            {/* ── Premium Content Section ─────────────────────────────── */}
            <div className={`card bg-base-100 shadow-sm border ${unlockedPremium ? 'border-indigo-500/50 bg-indigo-50/50' : 'border-base-200'}`}>
                <div className="card-body p-6">
                    <h2 className="card-title justify-between text-lg">
                        <span className="flex items-center gap-2">💎 Masterclass: System Design</span>
                        {unlockedPremium ? <span className="badge badge-primary badge-sm uppercase">Unlocked</span> : <span className="badge badge-ghost badge-sm uppercase">Locked</span>}
                    </h2>

                    <div className="mt-4">
                        {unlockedPremium ? (
                            <div className="relative pt-[40%] bg-black rounded-xl overflow-hidden group cursor-pointer shadow-lg"
                                onClick={() => setOpenVideo('SqcY0GlETPk')}>
                                <img src={`https://img.youtube.com/vi/SqcY0GlETPk/hqdefault.jpg`} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="thumbnail" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white pl-1 border border-white/50 group-hover:scale-110 transition-transform">
                                        <IconPlay />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-32 bg-slate-50 rounded-xl flex items-center justify-center gap-4 border border-dashed border-slate-300">
                                <span className="text-slate-400"><IconLock /></span>
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-sm text-slate-500 font-medium">Premium Content</span>
                                    <button className="btn btn-sm btn-primary gap-2" onClick={unlockPremium}>
                                        Unlock (50 Coins)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Course Cards ─────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {COURSES.map(course => {
                    const earned = hasBadge(course.id)
                    const isCompleted = completedModules.includes(course.id)

                    return (
                        <div key={course.id} className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                            {/* Thumbnail Area */}
                            <div
                                className="relative h-48 flex items-center justify-center cursor-pointer overflow-hidden"
                                onClick={() => {
                                    setOpenVideo(course.youtubeId)
                                }}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${course.color} transition-transform duration-700 group-hover:scale-105`} />

                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />

                                {/* Tier Ribbon */}
                                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-sm">
                                    {course.tier}
                                </div>

                                <div className="z-10 text-6xl drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-300 filter group-hover:brightness-110">{course.badge}</div>

                                {/* Play Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[1px]">
                                    <div className="w-14 h-14 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-900 pl-1 shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <IconPlay />
                                    </div>
                                </div>

                                {/* Earned Overlay */}
                                {earned && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-600/90 text-white backdrop-blur-sm z-20">
                                        <div className="w-12 h-12 bg-white text-emerald-600 rounded-full flex items-center justify-center mb-2 shadow-lg scale-0 animate-in zoom-in duration-300">
                                            <IconCheck />
                                        </div>
                                        <div className="font-bold text-sm uppercase tracking-wider animate-in fade-in slide-in-from-bottom-2 duration-500">Verified</div>
                                    </div>
                                )}
                            </div>

                            {/* Card Body */}
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`badge ${LEVEL_COLOR[course.level]} badge-sm uppercase text-[10px] font-bold tracking-wide border-0`}>{course.level}</span>
                                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex-1 text-right">{course.duration}</span>
                                </div>

                                <h3 className="font-bold text-lg text-slate-800 leading-tight mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed mb-6 line-clamp-2">{course.description}</p>

                                <div>
                                    {earned ? (
                                        <div className="w-full py-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 border border-emerald-100">
                                            <IconCheck /> Credential Owned
                                        </div>
                                    ) : (
                                        <button
                                            className={`btn btn-block border-0 ${isCompleted ? 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-900/20' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'} ${claiming === course.id ? 'loading' : ''}`}
                                            onClick={() => isCompleted && handleClaim(course.id, course.title)}
                                            disabled={claiming !== null || !isCompleted}
                                        >
                                            {claiming === course.id ? '' : (isCompleted ? 'Claim Certificate' : 'Watch to Unlock')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="text-center pt-12 pb-8 opacity-40 hover:opacity-100 transition-opacity">
                <button
                    className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                    onClick={() => {
                        if (confirm('Reset Account? This will clear all local progress and fix any data issues.')) {
                            const keysToRemove = []
                            for (let i = 0; i < localStorage.length; i++) {
                                const key = localStorage.key(i)
                                if (key && key.startsWith('scholar_')) {
                                    keysToRemove.push(key)
                                }
                            }
                            keysToRemove.forEach(k => localStorage.removeItem(k))
                            localStorage.setItem('scholar_demo_mode', 'true')
                            window.location.href = window.location.href
                        }
                    }}
                >
                    Reset App State
                </button>
            </div>
        </div>
    )
}

// ICONS (SVGs) - Moved outside component to prevent re-creation on render
const IconScholar = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
)
const IconFire = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.5-3.3.3-1.09.8-2.19 1.5-3.19C8 9.5 7 11.5 8.5 14.5z" /></svg>
)
const IconCoin = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>
)
const IconCert = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
)
const IconPlay = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
)
const IconCheck = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
)
const IconLock = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
)

export default StudentPanel
