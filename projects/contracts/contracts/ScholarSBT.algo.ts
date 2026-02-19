import { Contract } from '@algorandfoundation/tealscript';

export class ScholarSBT extends Contract {
    /**
     * Global State: The administrator/creator of the contract.
     * This address has the exclusive right to create new milestones.
     */
    admin = GlobalStateKey<Address>();

    createApplication(): void {
        this.admin.value = this.txn.sender;
        this.milestoneCount.value = 0;
    }

    /**
     * Global State: Counter for the total number of milestones created.
     * Used to generate unique IDs for each milestone.
     */
    milestoneCount = GlobalStateKey<uint64>();

    /**
     * Box Storage: Stores the metadata for each milestone.
     * Key: milestoneId (uint64)
     * Value: { name: string, uri: string }
     * We use a BoxMap to allow for an unlimited number of milestones.
     */
    milestones = BoxMap<uint64, { name: string; uri: string }>();

    /**
     * Local State: Tracks which milestones a specific student has claimed.
     * Key: studentAddress (implicitly the account with local state)
     * Value: StaticArray<uint64, 16> - Stores up to 16 claimed milestone IDs.
     * NOTE: For unlimited claims, we would use a BoxMap (claimed_student_milestone -> bool),
     * but for this Hackathon demo, Local State is faster and effectively demonstrates 'Opt-In'.
     */
    claimedBadges = LocalStateKey<StaticArray<uint64, 16>>();

    /**
     * Create a new milestone (Admin only).
     * @param name Name of the milestone (e.g., "Lakshya Batch 90%")
     * @param uri Metadata URI (e.g., IPFS link to image/json)
     */
    createMilestone(name: string, uri: string): void {
        verifyTxn(this.txn, { sender: this.admin.value });

        this.milestoneCount.value = this.milestoneCount.value + 1;
        const id = this.milestoneCount.value;

        this.milestones(id).value = { name: name, uri: uri };
    }

    /**
     * Student claims a specific milestone badge.
     * @param milestoneId The ID of the milestone to claim.
     */
    claimScholarSBT(milestoneId: uint64): void {
        assert(milestoneId <= this.milestoneCount.value);
        assert(milestoneId > 0);

        const badges = this.claimedBadges(this.txn.sender).value;
        let inserted = false;

        for (let i = 0; i < 16; i = i + 1) {
            if (badges[i] === milestoneId) {
                return;
            }
            if (badges[i] === 0 && !inserted) {
                badges[i] = milestoneId;
                inserted = true;
            }
        }

        assert(inserted); // Fail if no empty slot found
        this.claimedBadges(this.txn.sender).value = badges;
    }

    /**
     * Read-only method to fetch student's earned SBTs.
     * @param student The address of the student to look up.
     * @returns The list of milestone IDs earned by the student.
     */
    getScholarBadges(student: Address): StaticArray<uint64, 16> {
        return this.claimedBadges(student).value;
    }
}
