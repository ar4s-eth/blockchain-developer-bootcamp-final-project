import {getMainnetSdk} from '@dethcrypto/eth-sdk-client';
import {ethers, getNamedAccounts} from 'hardhat';
import {DAI, UniswapV2Router02, USDC, WETH} from '@dethcrypto/eth-sdk-client/types';

const _Contracts = async function () {
  const {deployer} = await getNamedAccounts();
  return getMainnetSdk(await ethers.getSigner(deployer));
};

export const swapExactETHForTokens = async (_instance: UniswapV2Router02, _exactETH: string, _callerTOKEN: any) => {
  const {Tokens} = await _Contracts();
  if (_callerTOKEN.address === _callerTOKEN.signer.address) {
    return console.log(`Please enter user.TOKEN`);
  }
  const path = [Tokens.WETH.address, _callerTOKEN.address];
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const expiryDate = nowInSeconds + 900;
  const txn = await _instance.swapExactETHForTokens(0, path, _callerTOKEN.signer.address, expiryDate, {
    gasLimit: 1000000,
    gasPrice: ethers.utils.parseUnits('10', 'gwei'),
    value: ethers.utils.parseEther(_exactETH),
  });
  const contractReceipt = await txn.wait();
  return contractReceipt;
};
