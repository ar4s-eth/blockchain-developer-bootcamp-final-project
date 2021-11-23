import {Contract, Signer} from 'ethers';
import {ethers} from 'hardhat';
import {getMainnetSdk} from '@dethcrypto/eth-sdk-client';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/dist/src/signers';
import {Address} from '@dethcrypto/eth-sdk';

export interface User {
  [address: string]: string | SignerWithAddress | {[contractName: string]: Contract};
}
[];

export interface Users {
  [name: string]: {
    [address: string]: string | SignerWithAddress | {[contractName: string]: Contract};
  };
}

export async function setupUsers<T extends {[contractName: string]: Contract}>(
  addresses: string[],
  contracts: T
): Promise<User[]> {
  const users: User[] = [];

  for (const address of addresses) {
    users.push(await setupUser(address, contracts));
  }
  return users as User[];
}

export async function setupUser<T extends {[contractName: string]: Contract}>(
  address: string,
  contracts: T
): Promise<User> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: User = {
    address,
    signer: await ethers.getSigner(address),
  };
  for (const key of Object.keys(contracts)) {
    const signer = await ethers.getSigner(address);
    user[key] = contracts[key].connect(signer);
  }
  return user as User;
}

// export async function setupNamedUsers<T extends {[contractName: string]: Contract}>(
//   _account: {[name: string]: string},
//   _contracts: T
// ): Promise<{[name: string]: {address: string} & T}> {
//   let result: {[name: string]: {address: string} & T} = {};
//   const iterableObj = {
//     async *[Symbol.asyncIterator]() {
//       for (const item in _account) {
//         yield {[item]: await setupUser(_account[item], _contracts)};
//       }
//     },
//   };
//   for await (const item of iterableObj) {
//     result = {
//       ...result,
//       ...item,
//     };
//   }
//   return result;
// }
