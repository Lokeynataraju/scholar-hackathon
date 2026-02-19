import { AlgorandClient } from '@algorandfoundation/algokit-utils';
import { ScholarSbtFactory } from '../contracts/clients/ScholarSBTClient';

async function deploy() {
    // Connect to LocalNet (algod at localhost:4001, kmd at localhost:4002, indexer at localhost:8980)
    const algorand = AlgorandClient.fromConfig({
        algodConfig: {
            server: 'http://localhost',
            port: 4001,
            token: 'a'.repeat(64),
        },
        kmdConfig: {
            server: 'http://localhost',
            port: 4002,
            token: 'a'.repeat(64),
        },
        indexerConfig: {
            server: 'http://localhost',
            port: 8980,
            token: 'a'.repeat(64),
        },
    });

    // Get a funded account from KMD LocalNet default wallet
    const kmdAccount = await algorand.account.kmd.getOrCreateWalletAccount('unencrypted-default-wallet');
    const addr = kmdAccount.addr.toString();

    algorand.setSigner(addr, kmdAccount.signer);

    console.log(`Using account: ${addr}`);

    const factory = new ScholarSbtFactory({
        algorand,
        defaultSender: addr,
    });

    console.log(`Deploying ScholarSBT to LocalNet...`);

    try {
        const { result } = await factory.deploy({
            createParams: {
                method: 'createApplication',
                args: [],
            },
            onSchemaBreak: 'append',
            onUpdate: 'append',
        });

        console.log(`\n✅ Contract deployed successfully!`);
        // @ts-ignore
        console.log(`APP_ID: ${result.appId}`);
        // @ts-ignore
        console.log(`APP_ADDRESS: ${result.appAddress}`);
        console.log(`ADMIN: ${addr}`);
        console.log(`\n👉 Add to frontend/.env:`);
        // @ts-ignore
        console.log(`VITE_SCHOLAR_SBT_APP_ID=${result.appId}`);
    } catch (e: any) {
        console.error('Deployment failed:', e.message ?? e);
    }
}

deploy();
