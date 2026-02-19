import * as algosdk from 'algosdk';

async function checkBalance() {
    // Connect to Testnet via AlgoNode (free, no API key needed)
    const algodServer = 'https://testnet-api.algonode.cloud';
    const algodClient = new algosdk.Algodv2('', algodServer, 443);

    const address = 'VKGBB26JNXSRTD4LQAAAJ2NA4447O2TLKGMUUC4YZW7MTNSF6CZQC7SARA';

    try {
        const accountInfo = await algodClient.accountInformation(address).do();
        console.log(`Address: ${address}`);
        console.log(`Balance: ${accountInfo.amount} microAlgos`);
        if (accountInfo.amount > 0) {
            console.log('STATUS: FUNDED');
        } else {
            console.log('STATUS: EMPTY');
        }
    } catch (e: any) {
        console.error('Error fetching balance:', e.message);
    }
}

checkBalance();
