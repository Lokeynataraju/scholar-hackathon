import React, { useState } from 'react'
import { ScholarSbtClient } from '../contracts/ScholarSBTClient'
import { useSnackbar } from 'notistack'

interface AdminPanelProps {
    appClient: ScholarSbtClient
    adminAddress: string
    activeAddress: string
}

const AdminPanel: React.FC<AdminPanelProps> = ({ appClient, adminAddress, activeAddress }) => {
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
            // appClient is initialized in Home.tsx with the wallet signer already set
            await appClient.send.createMilestone({
                args: { name, uri },
                sender: activeAddress,
            })

            enqueueSnackbar('Milestone created successfully!', { variant: 'success' })
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

    if (activeAddress !== adminAddress) {
        return null // Don't show if not admin
    }

    return (
        <div className="card bg-base-100 shadow-xl mt-4">
            <div className="card-body">
                <h2 className="card-title">PW Admin Panel</h2>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Milestone Name</span>
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Lakshya Batch 90%"
                        className="input input-bordered"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Metadata URI</span>
                    </label>
                    <input
                        type="text"
                        placeholder="ipfs://..."
                        className="input input-bordered"
                        value={uri}
                        onChange={(e) => setUri(e.target.value)}
                    />
                </div>
                <div className="form-control mt-6">
                    <button
                        className={`btn btn-primary ${loading ? 'loading' : ''}`}
                        onClick={handleCreate}
                        disabled={loading}
                    >
                        Create Milestone
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AdminPanel
