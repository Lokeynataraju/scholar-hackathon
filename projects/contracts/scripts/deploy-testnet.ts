import { AlgorandClient } from '@algorandfoundation/algokit-utils';
import { ScholarSbtFactory } from '../contracts/clients/ScholarSBTClient';
import * as algosdk from 'algosdk';

async function deploy() {
    const mnemonic = 'address immune vapor among wool color lounge panda parade write rally spin popular taste spread finger praise typical tennis silver charge girl desert abstract rule';
    const account = algosdk.mnemonicToSecretKey(mnemonic);

    delete process.env.ALGOD_SERVER;
    delete process.env.ALGOD_TOKEN;
    delete process.env.ALGOD_PORT;
    delete process.env.INDEXER_SERVER;
    delete process.env.INDEXER_TOKEN;
    const algodToken = '';
    const algodServer = 'https://testnet-api.algonode.cloud';
    const algodPort = 443;
    const indexerToken = '';
    const indexerServer = 'https://testnet-idx.algonode.cloud';
    const indexerPort = 443;

    console.log(`Using Node: ${algodServer}`);

    const algod = new algosdk.Algodv2(algodToken, algodServer, algodPort);
    const indexer = new algosdk.Indexer(indexerToken, indexerServer, indexerPort);

    const algorand = AlgorandClient.fromConfig({
        algodConfig: { token: algodToken, server: algodServer, port: algodPort },
        indexerConfig: { token: indexerToken, server: indexerServer, port: indexerPort },
    });
    algorand.setSignerFromAccount(account);

    const factory = new ScholarSbtFactory({
        algorand,
        defaultSender: account.addr,
    });

    console.log(`Deploying ScholarSBT to Testnet...`);

    const MAX_RETRIES = 10;
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const { result } = await factory.deploy({
                createParams: {
                    method: 'createApplication',
                    args: [],
                },
                onSchemaBreak: 'append',
                onUpdate: 'append',
            });
            console.log(`Contract deployed successfully!`);
            console.log(`APP_ID: ${Number(result.appId)}`);
            console.log(`APP_ADDRESS: ${result.appAddress}`);
            return;
        } catch (e: any) {
            console.warn(`Attempt ${i + 1} failed: ${e.message}`);
            if (i < MAX_RETRIES - 1) {
                console.log('Nodely Rate Limit (429) detected. Waiting 10 seconds...');
                await new Promise(resolve => setTimeout(resolve, 10000));
            } else {
                console.error('Final deployment attempt failed.');
                throw e;
            }
        }
    }
}

deploy();
