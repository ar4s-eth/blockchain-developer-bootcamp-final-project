import {expect} from './_chai-setup';
import {ethers, deployments, getUnnamedAccounts, getNamedAccounts} from 'hardhat';
import {setupUser, setupUsers} from './utils';
import {swapExactETHForTokens} from './helpers/uniswap-functions';
import {getMainnetSdk} from '@dethcrypto/eth-sdk-client';
import {AutoDock} from '../typechain';
import { UniswapV2Router02, USDC } from '@dethcrypto/eth-sdk-client/types';
import { BN , expectRevert} from '@openzeppelin/test-helpers';

const setup = deployments.createFixture(async () => {
  await deployments.fixture('AutoDock');
  // Accounts & Forked Contract(s) Setup
  const {superUser} = await getNamedAccounts();

  const _Contracts = getMainnetSdk(ethers.provider.getSigner());
  const UniswapV2Router02 = _Contracts.DeFi.UniswapV2.UniswapV2Router02;
  const WETH = _Contracts.Tokens.WETH;
  const USDC = _Contracts.Tokens.USDC;

  const contracts = {
    AutoDock: <AutoDock>await ethers.getContract('AutoDock_Implementation'),
    UniswapV2Router02,
    USDC,
    WETH,
  };

  const users = {
    unnamedUsers: await setupUsers(await getUnnamedAccounts(), contracts),
    superUser: await setupUser(superUser, contracts),
  };

  return {
    ...contracts,
    ...users
  };
});


describe('AutoDock', function () {
  describe('Initialization', function () {
    let _AutoDock: AutoDock;
    let _UniswapV2Router02: UniswapV2Router02;
    let _USDC: USDC;

    beforeEach(async function () {

    });


    it('superUser initial USDC balance of 0', async () => {
      const {superUser, AutoDock, UniswapV2Router02, USDC } = await setup();
        _AutoDock = AutoDock;
        _UniswapV2Router02 = UniswapV2Router02;
        _USDC = USDC;

      const usdcBalanceWei = await superUser.USDC.balanceOf(superUser.address);
      const usdcBalance = ethers.utils.formatUnits(usdcBalanceWei, 18);

      expect(parseFloat(usdcBalance)).to.equal(0);
    });
    it('superUser initial balance of 1000 ETH)', async () => {
      const {superUser} = await setup();

      const ethBalanceWei = await ethers.provider.getBalance(superUser.address);
      const ethBalance = ethers.utils.formatEther(ethBalanceWei);

      expect(parseFloat(ethBalance)).to.equal(10000);
    });
    it('Swap ETH for USDC', async () =>  {
      const {superUser, USDC} = await setup();

      await swapExactETHForTokens(_UniswapV2Router02, 1, USDC, superUser.address);

      const usdcBalanceWei = await USDC.balanceOf(superUser.address);
      const usdcBalance = ethers.utils.formatUnits(usdcBalanceWei, 6);
      expect(parseFloat(usdcBalance)).to.be.greaterThan(0);
    });
    it('superUser can send ETH to EOA', async () => {

      const {unnamedUsers, superUser} = await setup();
      const sender = superUser;
      const receiver = unnamedUsers[1];

      //Create Tx Object
      const tx = { //@ts-ignore
        to: receiver.address,
        value: ethers.utils.parseEther('1'),
      };

      // Sign and Send Tx - Wait for Receipt
      //@ts-ignore
      const createReceipt = await sender.signer.sendTransaction(tx);
      await createReceipt.wait();

      const senderEthBalance = ethers.utils.formatEther(await ethers.provider.getBalance(sender.address));
      const receiverEthBalance = ethers.utils.formatEther(await ethers.provider.getBalance(receiver.address));

      expect(parseFloat(senderEthBalance)).to.be.lessThan(10000);
      expect(parseFloat(receiverEthBalance)).to.be.greaterThan(10000);
    });
  });
  describe('Contract Interaction', function () {

    // let _AutoDock: AutoDock;
    // let _UniswapV2Router02: UniswapV2Router02;
    // let _USDC: USDC;
    // //@ts-ignore
    // let _superUser;

    beforeEach(async function () {
      this.value = new BN(10000);
    });

    it('event is logged', async function () {

      const {superUser, AutoDock, UniswapV2Router02, USDC } = await setup();

        // _AutoDock = AutoDock;
        // _UniswapV2Router02 = UniswapV2Router02;
        // _USDC = USDC;
        // //@ts-ignore
        // _superUser

      const testString = 'Peaches';

      await expect(superUser.AutoDock.setTest(testString)).to.emit(AutoDock, 'TestChanged').withArgs(testString);
    });
    it('superUser can send ETH to AutoDock', async () => {
      const {superUser, AutoDock} = await setup();
      const balance = await AutoDock.getBalance()
      //@ts-ignore
      console.log(`balance`, parseFloat(balance))
      const sender = superUser;
      const receiver = AutoDock;

      // Create Tx Object
      const tx = {
        to: receiver.address,
        value: ethers.utils.parseEther('1'),
      };

      // Sign and Send Tx - Wait for Receipt
      //@ts-ignore
      const createReceipt = await sender.signer.sendTransaction(tx);
      await createReceipt.wait();

      const senderEthBalance = ethers.utils.formatEther(await ethers.provider.getBalance(sender.address));
      const receiverEthBalance = ethers.utils.formatEther(await ethers.provider.getBalance(receiver.address));

      expect(parseFloat(senderEthBalance)).to.be.lessThan(10000);
      expect(parseFloat(receiverEthBalance)).to.be.greaterThan(0);
    });
    it('AutoDock reverts() ETH Deposit when full', async () => {
      const {superUser, AutoDock} = await setup();

      const sender = superUser;
      const senderBalance = ethers.utils.formatEther(await ethers.provider.getBalance(sender.address))
      console.log(`sender Balance`, senderBalance);
      const receiver = AutoDock;

      // Create Tx Object
      const tx = {
        to: receiver.address,
        value: ethers.utils.parseEther('11'),
      };

      //@ts-ignore
      await expectRevert(sender.signer.sendTransaction(tx), "AutoDock is full");
      expect(senderBalance).to.equal(ethers.utils.formatEther(await ethers.provider.getBalance(sender.address)));
    });
    it('ETH sent to AutoDock is partially refunded to sender', async () => {
      const {superUser, AutoDock} = await setup();

      const sender = superUser;
      const senderBalance = ethers.utils.formatEther(await ethers.provider.getBalance(sender.address))
      const receiver = AutoDock;

      // Create Tx Object
      const tx = {
        to: receiver.address,
        value: ethers.utils.parseEther('1'),
      };


      // Sign and Send Tx - Wait for Receipt
      //@ts-ignore
      const createReceipt = await sender.signer.sendTransaction(tx);
      await createReceipt.wait();

      const senderEthBalance = ethers.utils.formatEther(await ethers.provider.getBalance(sender.address));
      const receiverEthBalance = ethers.utils.formatEther(await ethers.provider.getBalance(receiver.address));

      expect(parseFloat(Number(receiverEthBalance).toFixed())).to.be.within(0.2, 1);
      expect(parseFloat(Number(senderEthBalance).toFixed())).to.be.within(9995, 10000);
      expect(senderBalance).to.not.equal(ethers.utils.formatEther(await ethers.provider.getBalance(sender.address)));
    });
    it('Calling AutoDock getBalance() returns correct balance', async () => {
      const {AutoDock} = await setup();
      const AutoDockBalance = ethers.utils.formatEther(await ethers.provider.getBalance(AutoDock.address));
      const AutoDock_getBalance = ethers.utils.formatEther(await AutoDock.getBalance());

      expect(parseFloat(AutoDock_getBalance)).to.be.equals(parseFloat(AutoDockBalance));
    });
    it('emit works', async function () {
      const {superUser, AutoDock} = await setup();

      const sender = superUser;
      const receiver = AutoDock;

      //Create Tx Object
      const tx = {
        to: receiver.address,
        value: ethers.utils.parseEther('1'),
      };

      // Sign and Send Tx - Wait for Receipt
      //@ts-ignore
      const createReceipt = await sender.signer.sendTransaction(tx);
      await createReceipt.wait();

      await expect(AutoDock.fallback()).to.emit(AutoDock, 'DepositLog');
    });
  });
});
