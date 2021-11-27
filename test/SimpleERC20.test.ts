import {expect} from './_chai-setup';
import {ethers, deployments, getUnnamedAccounts, getNamedAccounts} from 'hardhat';
import {IERC20} from '../typechain';
import {setupUser, setupUsers} from './utils';

const setup = deployments.createFixture(async () => {
  await deployments.fixture('SimpleERC20');
  const {simpleERC20Beneficiary} = await getNamedAccounts();
  const contracts = {
    SimpleERC20: <IERC20>await ethers.getContract('SimpleERC20'),
  };
  const users = {
    unnamedUser: await setupUsers(await getUnnamedAccounts(), contracts),
  };
  return {
    ...contracts,
    ...users,
    simpleERC20Beneficiary: await setupUser(simpleERC20Beneficiary, contracts),
  };
});

describe('SimpleERC20', function () {
  it('transfer fails', async function () {
    const {unnamedUser} = await setup();
    await expect(unnamedUser[1].SimpleERC20.transfer(unnamedUser[2].address, 1)).to.be.revertedWith(
      'NOT_ENOUGH_TOKENS'
    );
  });

  it('transfer succeed', async function () {
    const {unnamedUser, simpleERC20Beneficiary, SimpleERC20} = await setup();
    await simpleERC20Beneficiary.SimpleERC20.transfer(unnamedUser[1].address, 1);

    await expect(simpleERC20Beneficiary.SimpleERC20.transfer(unnamedUser[1].address, 1))
      .to.emit(SimpleERC20, 'Transfer')
      .withArgs(simpleERC20Beneficiary.address, unnamedUser[1].address, 1);
  });
});
