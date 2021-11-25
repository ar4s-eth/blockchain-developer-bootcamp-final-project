// import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/dist/src/signers';
// import {ethers} from 'hardhat';
// import {Contract} from 'ethers';

// type Person = {
//   first: string;
//   last: string;
// };

// type ValidateStructure<T, Struct> = T extends Struct
//   ? Exclude<keyof T, keyof Struct> extends never
//     ? T
//     : never
//   : never;

// declare function savePerson<T>(person: ValidateStructure<T, Person>): void;

// const tooFew = {first: 'Stefan'};
// const exact = {first: 'Stefan', last: 'Baumgartner'};
// const tooMany = {first: 'Stefan', last: 'Baumgartner', age: 37};

// savePerson(tooFew); // 💥 doesn't work
// savePerson(exact); // ✅ satisfies the contract
// savePerson(tooMany); // 💥 doesn't work

// export type User = {
//   address: string;
//   signer: SignerWithAddress;
//   contractName: Contract;
// };

// export type Users = {
//   [userName: string]: {
//     address: string;
//     signer: SignerWithAddress;
//     contractName: Contract;
//   };
// };

// export async function setupUsers<T extends {[contractName: string]: Contract}>(
//   addresses: string[],
//   contracts: T
// ): Promise<User[]> {
//   const users: User[] = [];

//   for (const address of addresses) {
//     users.push(await setupUser(address, contracts));
//   }
//   return users as User[];
// }

// export async function setupUser<T extends {[contractName: string]: Contract}>(
//   address: string,
//   contracts: T
// ): Promise<User> {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   let user: Record<string, unknown> = {};
//   for (const name of Object.keys(contracts)) {
//     const signer = await ethers.getSigner(address); // <-- needed to connect to contracts
//     // user[name] <- computed name of the contract
//     // contracts[name].connect(signer) <-- grabs the details of the contract
//     user[name] = contracts[name].connect(signer);
//     user = {...user, address, signer: await ethers.getSigner(address)};
//     // const kontracts = contracts[name].connect(signer);
//   }
//   return user as User;
// }

// export async function setupNamedUsers<T extends {[contractName: string]: Contract}>(
//   _account: {[name: string]: string},
//   _contracts: T
// ): Promise<Users> {
//   let result: Users = {};
//   const iterableObj = {
//     async *[Symbol.asyncIterator]() {
//       for (const item in _account) {
//         yield {[item]: await setupUser(_account[item], _contracts)};
//       }
//     },
//   };
//   for await (const item of iterableObj) {
//     // console.log(`for await`, item);
//     result = {
//       ...result,
//       ...item,
//     };
//   }
//   return result as Users;
// }
