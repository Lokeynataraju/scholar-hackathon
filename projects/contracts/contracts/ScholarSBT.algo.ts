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
     * Local State: Student's coin balance.
     */
    coins = LocalStateKey<uint64>();

    /**
     * Earn coins for completing an activity.
     * In a production app, this would be restricted to admin or check a signature.
     * For hackathon demo, student can call it (self-mint).
     * @param amount Amount of coins to add
     */
    earnCoins(amount: uint64): void {
        this.coins(this.txn.sender).value = this.coins(this.txn.sender).value + amount;
    }

    /**
     * Redeem coins for a reward.
     * @param rewardId ID of the item to redeem
     * @param cost Cost in coins
     */
    redeemReward(rewardId: uint64, cost: uint64): void {
        const balance = this.coins(this.txn.sender).value;
        assert(balance >= cost);
        this.coins(this.txn.sender).value = balance - cost;

        // Emitting an event or logging could happen here. 
        // For now, the deducted balance is proof enough.
    }

    /**
     * Read-only method to fetch student's earned SBTs.
     * @param student The address of the student to look up.
     * @returns The list of milestone IDs earned by the student.
     */
    getScholarBadges(student: Address): StaticArray<uint64, 16> {
        return this.claimedBadges(student).value;
    }

    /**
     * Allow user to opt-in to the contract.
     * Initializes their local state.
     */
    @allow.call('OptIn')
    optIn(): void {
        const empty: StaticArray<uint64, 16> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.claimedBadges(this.txn.sender).value = empty;
    }
}
