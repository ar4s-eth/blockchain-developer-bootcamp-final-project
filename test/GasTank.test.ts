import {expect} from './chai-setup';
import {ethers, deployments, getUnnamedAccounts, getNamedAccounts} from 'hardhat';
import {setupUser, setupUsers} from './utils';
import {swapExactETHForTokens} from './helpers/uniswap-functions';
import {getMainnetSdk} from '@dethcrypto/eth-sdk-client';
import {GasTank} from '../typechain';

const setup = deployments.createFixture(async () => {
  await deployments.fixture('GasTank');
  const {superUser} = await getNamedAccounts();

  const _Contracts = getMainnetSdk(ethers.provider.getSigner());
  const UniswapV2Router02 = _Contracts.DeFi.UniswapV2.UniswapV2Router02;
  const WETH = _Contracts.Tokens.WETH;
  const USDC = _Contracts.Tokens.USDC;

  const contracts = {
    GasTank: <GasTank>await ethers.getContract('GasTank_Implementation'),
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
    ...users,
    _Contracts,
  };
});

describe('GasTank', function () {
  describe('Initialization', function () {
    let GasTank_Instance: GasTank;

    it('superUser initial USDC balance of 0', async function () {
      const {superUser, GasTank} = await setup();
      GasTank_Instance = GasTank; // eslint-disable-line @typescript-eslint/no-unused-vars
      const usdcBalanceWei = await superUser.USDC.balanceOf(superUser.address);
      const usdcBalance = ethers.utils.formatUnits(usdcBalanceWei, 18);
      expect(parseFloat(usdcBalance)).to.equal(0);
    });
    it('superUser initial ETH (balance of 1000 ETH)', async () => {
      const {superUser} = await setup();
      const ethBalanceWei = await ethers.provider.getBalance(superUser.address);
      const ethBalance = ethers.utils.formatEther(ethBalanceWei);
      expect(parseFloat(ethBalance)).to.equal(10000);
    });
    it('Swap ETH for USDC', async function () {
      const {superUser, USDC} = await setup();
      await swapExactETHForTokens(1, USDC, superUser.address);
      const usdcBalanceWei = await USDC.balanceOf(superUser.address);
      const usdcBalance = ethers.utils.formatUnits(usdcBalanceWei, 6);
      expect(parseFloat(usdcBalance)).to.be.greaterThan(0);
    });
    it('superUser can send ETH to EOA', async function () {
      const {unnamedUsers, superUser} = await setup();

      const sender = superUser;
      const receiver = unnamedUsers[1];

      //Create Tx Object
      const tx = {
        to: receiver.address,
        value: ethers.utils.parseEther('1'),
      };

      // Sign and Send Tx - Wait for Receipt
      const createReceipt = await sender.signer.sendTransaction(tx);
      await createReceipt.wait();

      const senderEthBalance = ethers.utils.formatEther(await ethers.provider.getBalance(sender.address));
      const receiverEthBalance = ethers.utils.formatEther(await ethers.provider.getBalance(receiver.address));

      expect(parseFloat(senderEthBalance)).to.be.lessThan(10000);
      expect(parseFloat(receiverEthBalance)).to.be.greaterThan(10000);
    });
  });
  describe('Contract Interaction', async () => {
    let GasTank_Instance: GasTank;

    it('event is logged', async function () {
      const {superUser, GasTank} = await setup();
      GasTank_Instance = GasTank; // eslint-disable-line @typescript-eslint/no-unused-vars
      const testString = 'Peaches';
      await expect(superUser.GasTank.setTest(testString)).to.emit(GasTank, 'TestChanged').withArgs(testString);
    });
    it('superUser can send ETH to GasTank', async () => {
      const {superUser} = await setup();
      const sender = superUser;
      const receiver = GasTank_Instance;
      //Create Tx Object
      const tx = {
        to: receiver.address,
        value: ethers.utils.parseEther('1'),
      };
      // Sign and Send Tx - Wait for Receipt
      const createReceipt = await sender.signer.sendTransaction(tx);
      await createReceipt.wait();
      const senderEthBalance = ethers.utils.formatEther(await ethers.provider.getBalance(sender.address));
      const receiverEthBalance = ethers.utils.formatEther(await ethers.provider.getBalance(receiver.address));
      expect(parseFloat(senderEthBalance)).to.be.lessThan(10000);
      expect(parseFloat(receiverEthBalance)).to.be.greaterThan(0);
    });
    it('Calling GasTank getBalance() returns correct balance', async () => {
      const gasTankBalance = ethers.utils.formatEther(await ethers.provider.getBalance(GasTank_Instance.address));
      const GasTank_getBalance = ethers.utils.formatEther(await GasTank_Instance.getBalance());
      expect(parseFloat(GasTank_getBalance)).to.be.equals(parseFloat(gasTankBalance));
    });
    it('emit works', async function () {
      const {superUser} = await setup();
      const sender = superUser;
      const receiver = GasTank_Instance;
      //Create Tx Object
      const tx = {
        to: receiver.address,
        value: ethers.utils.parseEther('1'),
      };
      // Sign and Send Tx - Wait for Receipt
      const receipt = await sender.signer.sendTransaction(tx);
      await receipt.wait();

      await expect(GasTank_Instance.fallback()).to.emit(GasTank_Instance, 'DepositLog');
    });
  });
});
