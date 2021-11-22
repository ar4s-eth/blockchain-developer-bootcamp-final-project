import {expect} from './chai-setup';
import {ethers, deployments, getUnnamedAccounts, getNamedAccounts} from 'hardhat';
import {setupUser, setupUsers, setupNamedUsers} from './utils';
import {getMainnetSdk} from '@dethcrypto/eth-sdk-client';
import {GasTank} from '../typechain';
import {sensitiveHeaders} from 'http2';

const setup = deployments.createFixture(async () => {
  await deployments.fixture('GasTank');
  const {superUser} = await getNamedAccounts();

  const fContracts = getMainnetSdk(ethers.provider.getSigner());

  const contracts = {
    GasTank: <GasTank>await ethers.getContract('GasTank'),
  };

  const users = {
    namedUsers: await setupNamedUsers(await getNamedAccounts(), contracts),
    unnamedUsers: await setupUsers(await getUnnamedAccounts(), contracts),
    superUser: await setupUser(superUser, contracts),
  };

  return {
    ...contracts,
    ...users,
    fContracts,
  };
});

describe('GasTank', function () {
  it('event is logged', async function () {
    const {superUser, GasTank} = await setup();
    const testString = 'Peaches';
    await expect(superUser.GasTank.setTest(testString)).to.emit(GasTank, 'TestChanged').withArgs(testString);
  });
  it('initial ETH balance of 1000 ETH', async () => {
    const {superUser} = await setup();
    const ethBalanceWei = await ethers.provider.getBalance(superUser.address);
    const ethBalance = ethers.utils.formatEther(ethBalanceWei);
    expect(parseFloat(ethBalance)).to.equal(10000);
  });
  it('Send ETH to EAO', async function () {
    const {unnamedUsers, superUser} = await setup();
    const sender = superUser.GasTank.signer;
    const receiver = unnamedUsers[1];

    //Create Tx Object
    const tx = {
      to: receiver.address,
      value: ethers.utils.parseEther('1'),
    };

    // Sign and Send Tx - Wait for Receipt
    const createReceipt = await sender.sendTransaction(tx);
    await createReceipt.wait();

    const senderEthBalanceWei = await ethers.provider.getBalance(superUser.address);
    // const receiverEthBalanceWei = await ethers.provider.getBalance(receiver.address);
    const senderEthBalance = ethers.utils.formatEther(senderEthBalanceWei);
    // const receiverEthBalance = ethers.utils.formatEther(receiverEthBalanceWei);
    expect(parseFloat(senderEthBalance)).to.be.lessThan(10000);
  });
  it('Receive ETH at EOA', async function () {
    const {unnamedUsers, superUser} = await setup();
    const sender = superUser.GasTank.signer;
    const receiver = unnamedUsers[1];

    //Create Tx Object
    const tx = {
      to: receiver.address,
      value: ethers.utils.parseEther('1'),
    };

    // Sign and Send Tx - Wait for Receipt
    const createReceipt = await sender.sendTransaction(tx);
    await createReceipt.wait();

    // const senderEthBalanceWei = await ethers.provider.getBalance(superUser.address);
    const receiverEthBalanceWei = await ethers.provider.getBalance(receiver.address);
    // const senderEthBalance = ethers.utils.formatEther(senderEthBalanceWei);
    const receiverEthBalance = ethers.utils.formatEther(receiverEthBalanceWei);
    console.log(`receiver balance`, receiverEthBalance);
    expect(parseFloat(receiverEthBalance)).to.be.greaterThan(10000);
  });
  // it('Send ETH to GasTank', async function () {
  //   const {unnamedUsers, superUser} = await setup();
  //   const sender = superUser.GasTank.signer;
  //   const receiver = unnamedUsers[1];

  //   //Create Tx Object
  //   const tx = {
  //     to: receiver.address,
  //     value: ethers.utils.parseEther('1'),
  //   };

  //   // Sign and Send Tx - Wait for Receipt
  //   const createReceipt = await sender.sendTransaction(tx);
  //   await createReceipt.wait();

  //   // const senderEthBalanceWei = await ethers.provider.getBalance(superUser.address);
  //   const receiverEthBalanceWei = await ethers.provider.getBalance(receiver.address);
  //   // const senderEthBalance = ethers.utils.formatEther(senderEthBalanceWei);
  //   const receiverEthBalance = ethers.utils.formatEther(receiverEthBalanceWei);
  //   console.log(`receiver balance`, receiverEthBalance);
  //   // expect(parseFloat(receiverEthBalance)).to.be.greaterThan(10000);
  // });
});
