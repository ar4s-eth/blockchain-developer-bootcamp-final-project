import {expect} from './chai-setup';
import {ethers, deployments, getUnnamedAccounts, getNamedAccounts} from 'hardhat';
import {setupUsers, setupUser} from './utils';
import {swapExactETHForTokens} from './helpers/uniswap-functions';
import {getMainnetSdk} from '@dethcrypto/eth-sdk-client';

const setup = deployments.createFixture(async () => {
  // Accounts & Forked Contract(s) Setup
  const {superUser} = await getNamedAccounts();

  const _Contracts = getMainnetSdk(await ethers.getSigner(superUser));

  const UniswapV2Router02 = _Contracts.DeFi.UniswapV2.UniswapV2Router02;
  const WETH = _Contracts.Tokens.WETH;
  const DAI = _Contracts.Tokens.DAI;
  const USDC = _Contracts.Tokens.USDC;

  const contracts = {
    UniswapV2Router02,
    WETH,
    DAI,
    USDC,
  };

  const users = {
    users: await setupUsers(await getUnnamedAccounts(), contracts),
    superUser: await setupUser(superUser, contracts),
  };

  return {
    ...contracts,
    ...users,
  };
});

describe('Uniswap', function () {
  const state = async function () {
    return await setup();
  };
  it('superUser initial balance of 1000 ETH)', async () => {
    const {superUser} = await setup();
    const ethBalanceWei = await ethers.provider.getBalance(superUser.address);
    const ethBalance = ethers.utils.formatEther(ethBalanceWei);
    expect(parseFloat(ethBalance)).to.equal(10000);
  });
  it('superUser initial balance of 0 DAI)', async () => {
    const {superUser, DAI} = await state();
    const daiBalanceWei = await DAI.balanceOf(superUser.address);
    const daiBalance = ethers.utils.formatUnits(daiBalanceWei, 18);
    expect(parseFloat(daiBalance)).to.equal(0);
  });
  it('superUser initial USDC (balance of 0)', async () => {
    const stateObject = await setup();
    const {superUser, USDC} = stateObject;
    const usdcBalanceWei = await USDC.balanceOf(superUser.address);
    const usdcBalance = ethers.utils.formatUnits(usdcBalanceWei, 18);
    expect(parseFloat(usdcBalance)).to.equal(0);
  });
  it('Swap ETH for DAI', async function () {
    const {superUser, DAI} = await setup();
    await swapExactETHForTokens(1, DAI, superUser.address);
    const daiBalanceWei = await DAI.balanceOf(superUser.address);
    const daiBalance = ethers.utils.formatUnits(daiBalanceWei, 18);
    expect(parseFloat(daiBalance)).to.be.greaterThan(0);
  });
  it('Swap ETH for USDC', async function () {
    const {superUser, USDC} = await setup();
    await swapExactETHForTokens(1, USDC, superUser.address);
    const usdcBalanceWei = await USDC.balanceOf(superUser.address);
    const usdcBalance = ethers.utils.formatUnits(usdcBalanceWei, 6);
    expect(parseFloat(usdcBalance)).to.be.greaterThan(0);
  });
});
