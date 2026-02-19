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
            // Result return should be [bigint, bigint, ...] (16 elements fixed)
            // We filter out 0s
            if (result.return) {
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
                // sender: { signer, addr } handled by AppClient if initialized correctly
            })
            enqueueSnackbar('Badge claimed successfully!', { variant: 'success' })
            setMilestoneId('')
            fetchBadges() // Refresh list
        } catch (e: any) {
            console.error(e)
            enqueueSnackbar(`Error: ${e.message}`, { variant: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card bg-base-100 shadow-xl mt-4">
            <div className="card-body">
                <h2 className="card-title">Student Dashboard</h2>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Claim a Badge (Enter Milestone ID)</span>
                    </label>
                    <div className="input-group">
                        <input
                            type="number"
                            placeholder="e.g. 1"
                            className="input input-bordered w-full"
                            value={milestoneId}
                            onChange={(e) => setMilestoneId(e.target.value)}
                        />
                        <button className={`btn btn-primary ${loading ? 'loading' : ''}`} onClick={handleClaim} disabled={loading}>
                            Claim
                        </button>
                    </div>
                </div>

                <div className="divider"></div>

                <h3 className="text-lg font-bold">My Scholar SBTs</h3>
                {myBadges.length === 0 ? (
                    <p className="text-gray-500">No badges earned yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {myBadges.map((badgeId) => (
                            <div key={badgeId.toString()} className="alert alert-success shadow-lg">
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span>Milestone ID: {badgeId.toString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default StudentPanel
