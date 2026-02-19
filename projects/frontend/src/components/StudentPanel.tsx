import React, { useState, useEffect } from 'react'
import { ScholarSbtClient } from '../contracts/ScholarSBTClient'
import { useSnackbar } from 'notistack'

interface StudentPanelProps {
    appClient: ScholarSbtClient
    activeAddress: string
}

const StudentPanel: React.FC<StudentPanelProps> = ({ appClient, activeAddress }) => {
    const [milestoneId, setMilestoneId] = useState('')
    const [myBadges, setMyBadges] = useState<bigint[]>([])
    const [loading, setLoading] = useState(false)
    const { enqueueSnackbar } = useSnackbar()

    const fetchBadges = async () => {
        try {
            const result = await appClient.send.getScholarBadges({
                args: { student: activeAddress }
            })
            if (result.return) {
                // Filter out 0s (empty slots in static array)
                const badges = result.return.filter((id) => id > 0n)
                setMyBadges(badges)
            }
        } catch (e) {
            console.error('Error fetching badges:', e)
        }
    }

    useEffect(() => {
        if (activeAddress) {
            fetchBadges()
        }
    }, [activeAddress])

    const handleClaim = async () => {
        if (!milestoneId) {
            enqueueSnackbar('Please enter a Milestone ID', { variant: 'warning' })
            return
        }

        setLoading(true)
        try {
            await appClient.send.claimScholarSbt({
                args: { milestoneId: BigInt(milestoneId) },
            })
            enqueueSnackbar('Badge claimed successfully!', { variant: 'success' })
            setMilestoneId('')
            fetchBadges()
        } catch (e: any) {
            console.error(e)
            enqueueSnackbar(`Error: ${e.message}`, { variant: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Profile & Claim */}
            <div className="md:col-span-1 space-y-6">
                {/* Profile Card */}
                <div className="card bg-base-100 shadow-xl border-t-4 border-primary">
                    <div className="card-body">
                        <h2 className="card-title text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            My Profile
                        </h2>
                        <div className="text-sm opacity-70 mt-2">Wallet Address</div>
                        <div className="badge badge-ghost p-3 font-mono text-xs break-all h-auto">
                            {activeAddress}
                        </div>
                        <div className="stat-value text-2xl mt-4">{myBadges.length}</div>
                        <div className="stat-desc">Total Badges Earned</div>
                    </div>
                </div>

                {/* Claim Card */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Claim New Badge
                        </h2>
                        <p className="text-sm opacity-70">Enter the Milestone ID provided by your instructor.</p>
                        <div className="join w-full mt-4">
                            <input
                                type="number"
                                placeholder="ID (e.g. 1)"
                                className="input input-bordered input-secondary join-item w-full"
                                value={milestoneId}
                                onChange={(e) => setMilestoneId(e.target.value)}
                            />
                            <button
                                className={`btn btn-secondary join-item ${loading ? 'loading' : ''}`}
                                onClick={handleClaim}
                                disabled={loading}
                            >
                                {loading ? '' : 'Claim'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Badges Grid */}
            <div className="md:col-span-2">
                <div className="card bg-base-100 shadow-xl min-h-[400px]">
                    <div className="card-body">
                        <h2 className="card-title text-2xl mb-6">
                            <span className="text-3xl">🏆</span> My Achievements
                        </h2>

                        {myBadges.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 opacity-50 border-2 border-dashed rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                <p>No badges earned yet.</p>
                                <p className="text-sm">Claim your first badge to see it here!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {myBadges.map((badgeId) => (
                                    <div key={badgeId.toString()} className="card bg-base-200 border border-base-300 hover:shadow-md transition-shadow">
                                        <div className="card-body flex flex-row items-center gap-4 p-4">
                                            <div className="avatar placeholder">
                                                <div className="bg-neutral-focus text-neutral-content rounded-full w-12">
                                                    <span className="text-xl">🎓</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-bold">Scholar SBT #{badgeId.toString()}</h3>
                                                <div className="badge badge-success badge-sm gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-3 h-3 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                    Verified
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StudentPanel
