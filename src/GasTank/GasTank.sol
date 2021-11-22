// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "hardhat-deploy/solc_0.8/proxy/Proxied.sol";
import "hardhat/console.sol";

contract GasTank is Proxied {
    string internal _prefix;
    string public test;
    event Log(uint256 gas);
    event TestChanged(string _test);

    // Fallback function must be declared as external.
    fallback() external payable {
        // send / transfer (forwards 2300 gas to this fallback function)
        // call (forwards all of the gas)
        emit Log(gasleft());
    }

    // Helper function to check the balance of this contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function postUpgrade(string memory prefix) public proxied {
        _prefix = prefix;
    }

    function setTest(string memory _test) public {
        test = string(abi.encodePacked(_prefix, _test));
        emit TestChanged(_test);
    }

    constructor(string memory prefix) {
        postUpgrade(prefix);
    }
}
