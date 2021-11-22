import {expect} from './chai-setup';
import {ethers, deployments, getUnnamedAccounts, getNamedAccounts} from 'hardhat';
import {GasTank} from '../typechain';
import {setupUser, setupUsers} from './utils';
import {getMainnetSdk} from '@dethcrypto/eth-sdk-client';

const setup = deployments.createFixture(async () => {
  await deployments.fixture('GasTank');
  const {superUser} = await getNamedAccounts();
  const sdk = getMainnetSdk(await ethers.getSigner(superUser));
  const SwapRouter = sdk.DeFi.UniswapV3.SwapRouter;

  const contracts = {
    GasTank: <GasTank>await ethers.getContract('GasTank'),
    SwapRouter: SwapRouter,
  };

  return {
    ...contracts,
    users: await setupUsers(await getUnnamedAccounts(), contracts),
    superUser: await setupUser(superUser, contracts),
  };
});

describe('GasTank', function () {
  it('event is logged', async function () {
    const {superUser, GasTank} = await setup();
    const testString = 'Peaches';
    await expect(superUser.GasTank.setTest(testString)).to.emit(GasTank, 'TestChanged').withArgs(testString);
  });
});
