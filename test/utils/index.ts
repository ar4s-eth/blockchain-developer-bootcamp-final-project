import {JsonRpcProvider} from '@ethersproject/providers';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/dist/src/signers';
import {Contract} from 'ethers';
import {ethers} from 'hardhat';

export async function setupUsers<T extends {[contractName: string]: Contract}, signer extends SignerWithAddress>(
  addresses: string[],
  contracts: T
): Promise<({address: string; signer: SignerWithAddress | JsonRpcProvider | signer} & T)[]> {
  const users: ({address: string; signer: SignerWithAddress | JsonRpcProvider | signer} & T)[] = [];
  for (const address of addresses) {
    users.push(await setupUser(address, contracts));
  }
  return users as ({address: string; signer: SignerWithAddress | JsonRpcProvider | signer} & T)[];
}

export async function setupUser<T extends {[contractName: string]: Contract}, signer extends SignerWithAddress>(
  address: string,
  contracts: T
): Promise<{address: string; signer: SignerWithAddress | JsonRpcProvider | signer} & T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = {address, signer: await ethers.getSigner(address)};

  let key: T;
  for (const key of Object.keys(contracts)) {
    user[key] = contracts[key].connect(await ethers.getSigner(address));
  }
  return user as {address: string; signer: SignerWithAddress | JsonRpcProvider | signer} & T;
}
