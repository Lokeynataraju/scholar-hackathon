import { AlgorandClient } from '@algorandfoundation/algokit-utils';

const client = AlgorandClient.testNet();
console.log('AlgorandClient keys:', Object.keys(client));
console.log('AlgorandClient.account keys:', Object.keys(client.account));
