// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "hardhat-deploy/solc_0.8/proxy/Proxied.sol";
import "hardhat/console.sol";

contract GasTank is Proxied {
    event TestChanged(string _test);

    string internal _prefix;
    string public test;

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
