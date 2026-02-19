import React, { useState } from 'react'
import { ScholarSbtClient } from '../contracts/ScholarSBTClient'
import { useSnackbar } from 'notistack'

interface AdminPanelProps {
    appClient: ScholarSbtClient
    adminAddress: string
    activeAddress: string
}

const AdminPanel: React.FC<AdminPanelProps> = ({ appClient, activeAddress }) => {
    // We already check activeAddress === adminAddress in Home.tsx, but good to be safe
    const [name, setName] = useState('')
    const [uri, setUri] = useState('')
    const [loading, setLoading] = useState(false)
    const { enqueueSnackbar } = useSnackbar()

    const handleCreate = async () => {
        if (!name || !uri) {
            enqueueSnackbar('Please fill in all fields', { variant: 'warning' })
            return
        }

        setLoading(true)
        try {
            const result = await appClient.send.createMilestone({
                args: { name, uri },
                sender: activeAddress,
            })

            enqueueSnackbar(`Milestone "${name}" created successfully!`, { variant: 'success' })
            // Logic to get the ID from logs/return would ideally go here to show the user
            // For now we just reset
            setName('')
            setUri('')
        } catch (e: unknown) {
            console.error(e)
            const msg = e instanceof Error ? e.message : String(e)
            enqueueSnackbar(`Error: ${msg}`, { variant: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Create Card */}
            <div className="card bg-base-100 shadow-xl border-t-4 border-error">
                <div className="card-body">
                    <h2 className="card-title text-error mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Create New Milestone
                    </h2>

                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-bold">Milestone Name</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Dean's List 2024"
                            className="input input-bordered w-full"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="form-control w-full mt-4">
                        <label className="label">
                            <span className="label-text font-bold">Metadata URI</span>
                            <span className="label-text-alt text-gray-500">IPFS / Arweave</span>
                        </label>
                        <input
                            type="text"
                            placeholder="ipfs://bafy..."
                            className="input input-bordered w-full font-mono text-sm"
                            value={uri}
                            onChange={(e) => setUri(e.target.value)}
                        />
                    </div>

                    <div className="card-actions justify-end mt-8">
                        <button
                            className={`btn btn-error text-white w-full ${loading ? 'loading' : ''}`}
                            onClick={handleCreate}
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create & Mint Badge'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Admin Stats / Help */}
            <div className="space-y-6">
                <div className="card bg-neutral text-neutral-content shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Admin Controls</h2>
                        <p>Only the authorized contract creator can access this panel.</p>
                        <div className="divider before:bg-neutral-content after:bg-neutral-content"></div>
                        <ul className="list-disc list-inside text-sm space-y-2">
                            <li>Create standardized milestones for students.</li>
                            <li>Each milestone gets a unique numeric ID.</li>
                            <li>Share this ID with students to let them claim.</li>
                            <li>Credentials are permanently stored on Algorand.</li>
                        </ul>
                    </div>
                </div>

                <div className="stats shadow w-full bg-base-100">
                    <div className="stat">
                        <div className="stat-figure text-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <div className="stat-title">Network</div>
                        <div className="stat-value text-secondary text-2xl">Testnet</div>
                        <div className="stat-desc">Connect to correct network</div>
                    </div>

                    <div className="stat">
                        <div className="stat-title">Contract</div>
                        <div className="stat-value text-primary text-2xl">Live</div>
                        <div className="stat-desc">Ready for minting</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminPanel
