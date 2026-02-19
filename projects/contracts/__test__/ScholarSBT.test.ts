import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import { Config } from '@algorandfoundation/algokit-utils';
import { ScholarSbtClient, ScholarSbtFactory } from '../contracts/clients/ScholarSBTClient';

const fixture = algorandFixture();
Config.configure({ populateAppCallResources: true });

let appClient: ScholarSbtClient;
let adminAddr: string;

describe('ScholarSBT', () => {
  beforeEach(fixture.beforeEach);

  beforeAll(async () => {
    await fixture.beforeEach();
    const { testAccount } = fixture.context;
    const { algorand } = fixture;
    adminAddr = testAccount.addr;

    const factory = new ScholarSbtFactory({
      algorand,
      defaultSender: testAccount.addr,
    });

    const createResult = await factory.send.create.createApplication();
    appClient = createResult.appClient;
  });

  test('createMilestone', async () => {
    await appClient.send.createMilestone({ args: { name: 'Lakshya Batch', uri: 'ipfs://QmTest' } });
  });

  test('claimScholarSBT', async () => {
    const { testAccount } = fixture.context;
    // 1. Opt-in to the application to allocate local state
    await appClient.appClient.send.bare.optIn();

    // 2. Create a milestone (ID 1)
    await appClient.send.createMilestone({ args: { name: 'Lakshya Batch', uri: 'ipfs://QmTest' } });

    // 3. Claim the milestone
    await appClient.send.claimScholarSbt({ args: { milestoneId: BigInt(1) } });

    // 4. Verify using the view method
    const result = await appClient.send.getScholarBadges({ args: { student: testAccount.addr } });

    // The result.return should be a Uint8Array or Array of BigInt depending on encoding.
    // StaticArray<uint64, 16> usually returns an array of BigInts in typescript client.
    // And it will be 16 elements long.
    // Index 0 should be 1n.
    expect(result.return![0]).toBe(BigInt(1));
  });
});
