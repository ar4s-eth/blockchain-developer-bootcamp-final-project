/* eslint-disable */
// @ts-nocheck
import {ethers} from 'hardhat';

export const isEOA = async (_target): boolean => {
  return (await ethers.provider.getCode(_target.address)) === '0x' ? true : false;
  // return isUndefined(_target) ? (await ethers.provider.getCode(_target.address)) === '0x' : 'Invalid Selection';
};
export async function getHumanReadableBalance(_entity) {
  if (isEOA(_entity)) {
    return parseFloat(ethers.utils.formatEther(await ethers.provider.getBalance(_entity.address))); // user ether balance
  } else if ((_entity.interface && isEOA(_entity) === false && _entity.signer._signer) ?? true === false) {
    return parseFloat(
      ethers.utils.formatUnits(await _entity.balanceOf(_entity.signer.address), await _entity.decimals())
    ); // user token balance
  } else if (_entity.signer._signer ?? true) {
    return parseFloat(ethers.utils.formatUnits(await _entity.balanceOf(_entity.address), await _entity.decimals())); // contract balance
  }
}
export async function sendN(_from: any, _amount: string, _to: receiver) {
  const isETHtx = isEOA(_from);

  if (!isETHtx) {
    const _decimals = await _from.decimals();
    await _from
      .transfer(_to.address, ethers.utils.parseUnits(_amount, await _decimals))
      .then(
        (transferResult, revert) => {
          // console.dir(transferResult);
          return transferResult.wait();
        },
        (revert) => revert
      )
      .catch((error) => {
        return error;
      });
  } // ether send
  else {
    const tx = {
      to: _to.address,
      value: ethers.utils.parseEther(_amount),
      // nonce: await ethers.provider.getTransactionCount(_from.address, 'latest'),
    };
    // console.dir(tx);
    try {
      await _from.signer.sendTransaction(tx).then((transaction) => {
        // console.dir(transaction);
        // console.log('Send finished!');
        // return console.log(transaction);
      });
    } catch (error) {
      // console.log('failed to send!!');
      // return console.log(error);
    }
  }
}

module.exports = {sendN, getHumanReadableBalance};
