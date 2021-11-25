import {getMainnetSdk} from '@dethcrypto/eth-sdk-client';
import {ethers, getNamedAccounts} from 'hardhat';
import {Contract} from 'ethers';

const _Contracts = async function () {
  const {deployer} = await getNamedAccounts();
  return getMainnetSdk(await ethers.getSigner(deployer));
};

export const swapExactETHForTokens = async (_exactETH: number, _token: Contract, _caller: string) => {
  const {Tokens, DeFi} = await _Contracts();
  const path = [Tokens.WETH.address, _token.address];
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const expiryDate = nowInSeconds + 900;
  const txn = await DeFi.UniswapV2.UniswapV2Router02.swapExactETHForTokens(0, path, _caller, expiryDate, {
    gasLimit: 1000000,
    gasPrice: ethers.utils.parseUnits('10', 'gwei'),
    value: ethers.utils.parseEther(_exactETH.toString()),
  });
  const contractReceipt = await txn.wait();
  return contractReceipt;
};
