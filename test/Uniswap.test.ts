import {expect} from './chai-setup';
import {ethers, deployments, getUnnamedAccounts, getNamedAccounts} from 'hardhat';
import {setupUser, setupUsers, setupNamedUsers} from './utils';
import {getMainnetSdk} from '@dethcrypto/eth-sdk-client';
import {Contract} from 'ethers';

const setup = deployments.createFixture(async () => {
  // Accounts & Forked Contract(s) Setup
  const {superUser} = await getNamedAccounts();

  const fContracts = getMainnetSdk(await ethers.getSigner(superUser));

  const UniswapV2Router02 = fContracts.DeFi.UniswapV2.UniswapV2Router02;
  const WETH = fContracts.Tokens.WETH;
  const DAI = fContracts.Tokens.DAI;
  const USDC = fContracts.Tokens.USDC;

  const contracts = {
    UniswapV2Router02: UniswapV2Router02,
    WETH,
    DAI,
    USDC,
  };
  const users = {
    namedUsers: await setupNamedUsers(await getNamedAccounts(), contracts),
    unnamedUsers: await setupUsers(await getUnnamedAccounts(), contracts),
    superUser: await setupUser(superUser, contracts),
  };
  return {
    ...contracts,
    ...users,
  };
});

const swapETHForToken = async (_token: Contract) => {
  const {UniswapV2Router02, WETH, superUser} = await setup();
  const path = [WETH.address, _token.address];
  const ethAmount = ethers.utils.parseEther('0.1');
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const expiryDate = nowInSeconds + 900;
  const txn = await UniswapV2Router02.swapExactETHForTokens(0, path, superUser.address, expiryDate, {
    gasLimit: 1000000,
    gasPrice: ethers.utils.parseUnits('10', 'gwei'),
    value: ethAmount,
  });
  const contractReceipt = await txn.wait();
  return contractReceipt;
};
const swapETHForUSDC = async () => {
  const {UniswapV2Router02, WETH, superUser} = await setup();
  const path = [WETH.address, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'];
  const ethAmount = ethers.utils.parseEther('0.1');
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const expiryDate = nowInSeconds + 900;
  const txn = await UniswapV2Router02.swapExactETHForTokens(0, path, superUser.address, expiryDate, {
    gasLimit: 1000000,
    gasPrice: ethers.utils.parseUnits('10', 'gwei'),
    value: ethAmount,
  });
  const contractReceipt = await txn.wait();
  return contractReceipt;
};

describe('Uniswap', function () {
  it('initial DAI balance of 0', async () => {
    const {superUser} = await setup();
    const daiBalanceWei = await superUser.DAI.balanceOf(superUser.address);
    const daiBalance = ethers.utils.formatUnits(daiBalanceWei, 18);
    expect(parseFloat(daiBalance)).to.equal(0);
  });
  it('initial USDC balance of 0', async () => {
    const {superUser} = await setup();
    const usdcBalanceWei = await superUser.USDC.balanceOf(superUser.address);
    const usdcBalance = ethers.utils.formatUnits(usdcBalanceWei, 18);
    expect(parseFloat(usdcBalance)).to.equal(0);
  });
  it('initial ETH balance of 1000 ETH', async () => {
    const {superUser} = await setup();
    const ethBalanceWei = await ethers.provider.getBalance(superUser.address);
    const ethBalance = ethers.utils.formatEther(ethBalanceWei);
    expect(parseFloat(ethBalance)).to.equal(10000);
  });
  it('Swap ETH for DAI', async function () {
    const {superUser, DAI} = await setup();
    await swapETHForToken(DAI);
    const daiBalanceWei = await superUser.DAI.balanceOf(superUser.address);
    const daiBalance = ethers.utils.formatUnits(daiBalanceWei, 18);
    expect(parseFloat(daiBalance)).to.be.greaterThan(0);
  });

  it('Swap ETH for USDC', async function () {
    const {superUser} = await setup();
    await swapETHForUSDC();
    const usdcBalanceWei = await superUser.USDC.balanceOf(superUser.address);
    const usdcBalance = ethers.utils.formatUnits(usdcBalanceWei, 6);
    expect(parseFloat(usdcBalance)).to.be.greaterThan(0);
  });
});
