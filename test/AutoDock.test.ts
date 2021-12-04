//@ts-nocheck
import {expect} from './_chai-setup';
import {ethers, deployments, getUnnamedAccounts, getNamedAccounts} from 'hardhat';
import {setupUser, setupUsers} from './utils';
import {swapExactETHForTokens} from './helpers/uniswap-functions';
import {getHumanReadableBalance, sendN} from './helpers/token-functions';
import {getMainnetSdk} from '@dethcrypto/eth-sdk-client';
import {AutoDock} from '../typechain';
import {UniswapV2Router02, USDC} from '@dethcrypto/eth-sdk-client/types';
import {BN, expectRevert} from '@openzeppelin/test-helpers';

const setup = deployments.createFixture(async () => {
  await deployments.fixture('AutoDock');
  // Accounts & Forked Contract(s) Setup
  const {superUser} = await getNamedAccounts();

  const _Contracts = getMainnetSdk(ethers.provider.getSigner());
  const UniswapV2Router02 = _Contracts.DeFi.UniswapV2.UniswapV2Router02;
  const WETH = _Contracts.Tokens.WETH;
  const USDC = _Contracts.Tokens.USDC;
  const DAI = _Contracts.Tokens.DAI;

  const contracts = {
    AutoDock: <AutoDock>await ethers.getContract('AutoDock_Implementation'),
    UniswapV2Router02,
    USDC,
    WETH,
    DAI,
  };

  const users = {
    unnamedUsers: await setupUsers(await getUnnamedAccounts(), contracts),
    superUser: await setupUser(superUser, contracts),
  };

  return {
    ...contracts,
    ...users,
  };
});

describe('AutoDock', function () {
  describe('Initialization', function () {
    // let _AutoDock: AutoDock;
    // let _UniswapV2Router02: UniswapV2Router02;
    // let _USDC: USDC;

    beforeEach(async function () {});

    it('superUser initial USDC balance of 0', async () => {
      const {superUser, AutoDock, UniswapV2Router02, USDC} = await setup();

      expect(await getHumanReadableBalance(superUser.USDC)).to.equal(0.0);
    });
    it('superUser initial balance of 1000 ETH)', async () => {
      const {superUser} = await setup();

      expect(await getHumanReadableBalance(superUser)).to.equal(10000.0);
    });
    it('Swap ETH for USDC', async () => {
      const {superUser, USDC, UniswapV2Router02} = await setup();
      const swapper = superUser;

      await swapExactETHForTokens(UniswapV2Router02, '1', swapper.USDC);

      expect(await getHumanReadableBalance(swapper.USDC)).to.be.at.least(1.0);
    });
    it('superUser can send ETH to EOA', async () => {
      const {unnamedUsers, superUser} = await setup();
      const sender = superUser;
      const receiver = unnamedUsers[1];

      await sendN(sender, '42', receiver);

      expect(await getHumanReadableBalance(sender)).to.be.lessThan(10000);
      expect(await getHumanReadableBalance(receiver)).to.be.greaterThan(10000);
    });
  });
  describe('Contract Interaction', function () {
    // let _AutoDock: AutoDock;
    // let _UniswapV2Router02: UniswapV2Router02;
    // let _USDC: USDC;
    // //@ts-ignore
    // let _superUser;

    // beforeEach(async function () {
    //   this.value = new BN(10000);
    // });

    it('event is logged', async function () {
      const {superUser, AutoDock, UniswapV2Router02, USDC} = await setup();

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
      const sender = superUser;
      const receiver = AutoDock;

      await sendN(sender, '4.2', receiver);

      expect(await getHumanReadableBalance(sender)).to.be.lessThan(10000);
      expect(await getHumanReadableBalance(receiver)).to.be.greaterThan(0);
    });
    it('AutoDock reverts() ETH Deposit when full', async () => {
      const {superUser, AutoDock} = await setup();
      const sender = superUser;
      const receiver = AutoDock;

      expectRevert(await sendN(sender, '42', receiver), 'AutoDock is full').catch();
      expect(await getHumanReadableBalance(sender)).to.be.equal(
        parseFloat(ethers.utils.formatEther(await ethers.provider.getBalance(sender.address)))
      ); // compares original amount to final amount
    });
    it('ETH sent to AutoDock is partially refunded to sender', async () => {
      const {superUser, AutoDock} = await setup();
      const sender = superUser;
      const receiver = AutoDock;

      await sendN(sender, '4.2', receiver);

      expect(await getHumanReadableBalance(receiver)).to.be.within(0.1, 4.2);
      expect(await getHumanReadableBalance(sender)).to.be.within(9995, 10000);
      expect(await getHumanReadableBalance(sender)).to.not.equal(
        ethers.utils.formatEther(await ethers.provider.getBalance(sender.address))
      );
    });
    it.only('superUser can send USDC to AutoDock', async () => {
      const {superUser, unnamedUsers, AutoDock, DAI, USDC, UniswapV2Router02} = await setup();
      const sender = superUser;
      const receiver = AutoDock;

      await swapExactETHForTokens(UniswapV2Router02, '1000', superUser.USDC);
      await sendN(sender.USDC, '1000', receiver);
      console.log(await AutoDock.totalSupply());
      console.log(await getHumanReadableBalance(AutoDock));
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
