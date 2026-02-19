import { AlgorandClient } from '@algorandfoundation/algokit-utils';
import { ScholarSbtFactory } from '../contracts/clients/ScholarSBTClient';
import * as algosdk from 'algosdk';

async function deploy() {
    const mnemonic = 'table harbor come mouse quantum gloom cement obtain foil waste often pilot fade edge angry tuna kit dumb rabbit wood nuclear clump oblige abandon forward';
    const account = algosdk.mnemonicToSecretKey(mnemonic);

    const algorand = AlgorandClient.testNet();
    algorand.setSignerFromAccount(account);

    const factory = new ScholarSbtFactory({
        algorand,
        defaultSender: account.addr,
    });

    console.log(`Deploying ScholarSBT to Testnet...`);

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
        // @ts-ignore
        console.log(`APP_ID: ${result.appId}`);
        // @ts-ignore
        console.log(`APP_ADDRESS: ${result.appAddress}`);
    } catch (e: any) {
        console.error('Deployment failed:', e);
    }
}

deploy();
