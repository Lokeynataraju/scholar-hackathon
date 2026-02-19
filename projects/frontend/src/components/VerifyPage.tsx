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
    const [hasSearched, setHasSearched] = useState(false)
    const { enqueueSnackbar } = useSnackbar()

    const handleVerify = async () => {
        if (!studentAddress) {
            enqueueSnackbar('Please enter a Student Address', { variant: 'warning' })
            return
        }

        setLoading(true)
        setBadges([])
        setHasSearched(false)
        try {
            const result = await appClient.send.getScholarBadges({
                args: { student: studentAddress }
            })
            if (result.return) {
                const earnedBadges = result.return.filter((id) => id > 0n)
                setBadges(earnedBadges)
            }
            setHasSearched(true)
        } catch (e: any) {
            console.error(e)
            enqueueSnackbar(`Error: ${e.message}`, { variant: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto mt-8">
            <div className="card bg-base-100 shadow-xl border-t-4 border-secondary">
                <div className="card-body">
                    <h2 className="card-title text-2xl text-secondary mb-4 justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Credential Verification
                    </h2>
                    <p className="text-center text-base-content/70 mb-6">
                        Instantly verify the authenticity of any scholar's achievements on the Algorand blockchain.
                    </p>

                    <div className="join w-full">
                        <input
                            type="text"
                            placeholder="Paste Student Algorand Address..."
                            className="input input-bordered input-secondary join-item w-full font-mono text-sm"
                            value={studentAddress}
                            onChange={(e) => setStudentAddress(e.target.value)}
                        />
                        <button
                            className={`btn btn-secondary join-item px-8 ${loading ? 'loading' : ''}`}
                            onClick={handleVerify}
                            disabled={loading}
                        >
                            {loading ? '' : 'Verify'}
                        </button>
                    </div>

                    {hasSearched && (
                        <div className="mt-8 animate-fade-in-up">
                            <div className="divider">Verification Results</div>

                            {badges.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="alert alert-success shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <div>
                                            <h3 className="font-bold">Verified: Authentic Identity</h3>
                                            <div className="text-xs">Found {badges.length} valid credentials for this address.</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        {badges.map((badgeId) => (
                                            <div key={badgeId.toString()} className="flex items-center p-4 bg-base-200 rounded-lg border border-base-300">
                                                <div className="avatar placeholder mr-4">
                                                    <div className="bg-neutral text-neutral-content rounded-full w-10">
                                                        <span className="text-lg">📜</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold">Scholar SBT #{badgeId.toString()}</div>
                                                    <div className="text-xs text-base-content/60">Issued on Testnet</div>
                                                </div>
                                                <div className="badge badge-primary badge-outline">Active</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="alert alert-warning shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <div>
                                        <h3 className="font-bold">No Credentials Found</h3>
                                        <div className="text-xs">This address has not earned any Scholar SBTs yet.</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VerifyPage
