import * as algosdk from 'algosdk';
import * as fs from 'fs';
import * as path from 'path';

const account = algosdk.generateAccount();
const content = `New Account Generic:
Address: ${account.addr}
Mnemonic: ${algosdk.secretKeyToMnemonic(account.sk)}
--------------------------------------------------
Please fund this account using the Algorand Testnet Dispenser: https://lora.algokit.io/testnet/faucet
`;

console.log(content);
fs.writeFileSync(path.join(__dirname, 'account_credentials.txt'), content);
console.log('Credentials written to account_credentials.txt');
