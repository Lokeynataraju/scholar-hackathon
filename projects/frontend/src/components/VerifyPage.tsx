import React, { useState } from 'react'
import { ScholarSbtClient } from '../contracts/ScholarSBTClient'
import { useSnackbar } from 'notistack'

interface VerifyPageProps {
    appClient: ScholarSbtClient
}

const VerifyPage: React.FC<VerifyPageProps> = ({ appClient }) => {
    const [studentAddress, setStudentAddress] = useState('')
    const [badges, setBadges] = useState<bigint[]>([])
    const [loading, setLoading] = useState(false)
    const { enqueueSnackbar } = useSnackbar()

    const handleVerify = async () => {
        if (!studentAddress) {
            enqueueSnackbar('Please enter a Student Address', { variant: 'warning' })
            return
        }

        setLoading(true)
        setBadges([])
        try {
            const result = await appClient.send.getScholarBadges({
                args: { student: studentAddress }
            })
            if (result.return) {
                const earnedBadges = result.return.filter((id) => id > 0n)
                setBadges(earnedBadges)
                if (earnedBadges.length === 0) {
                    enqueueSnackbar('No badges found for this student.', { variant: 'info' })
                }
            }
        } catch (e: any) {
            console.error(e)
            enqueueSnackbar(`Error fetching badges: ${e.message}`, { variant: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card bg-base-100 shadow-xl mt-4">
            <div className="card-body">
                <h2 className="card-title">Verify Student Credentials</h2>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Student Algorand Address</span>
                    </label>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Address..."
                            className="input input-bordered w-full"
                            value={studentAddress}
                            onChange={(e) => setStudentAddress(e.target.value)}
                        />
                        <button className={`btn btn-secondary ${loading ? 'loading' : ''}`} onClick={handleVerify} disabled={loading}>
                            Verify
                        </button>
                    </div>
                </div>

                {badges.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-lg font-bold">Earned Badges</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            {badges.map((badgeId) => (
                                <div key={badgeId.toString()} className="alert alert-info shadow-lg">
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        <span>Milestone ID: {badgeId.toString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default VerifyPage
