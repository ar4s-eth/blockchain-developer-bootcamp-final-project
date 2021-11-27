// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "hardhat-deploy/solc_0.8/proxy/Proxied.sol";
import "hardhat/console.sol";

contract Depositor {

    receive() external payable {}
}



contract AutoDock is Proxied {
    string internal _prefix;
    string public test;
    address public target = msg.sender;
    event DepositLog(uint256 gas);
    event FallbackLog(string text);
    event TestChanged(string _test);

        constructor(string memory prefix) {
        postUpgrade(prefix);
    }

    Depositor private receiverAdr = new Depositor();

    function sendEther(uint _amount) public payable {
        // if (!address(receiverAdr).send(_amount)) {
        //     //handle failed send
        // }
    }

    function callValueEther(uint _amount) public payable {
        (bool success,) = address(receiverAdr).call{value: _amount, gas: 35000}("");
        require(success);
    }

    function transferEther(uint _amount) public payable {
        payable(receiverAdr).transfer(_amount);
    }

    // Fallback function must be declared as external.
    // fallback() external payable {
    //     // send / transfer (forwards 2300 gas to this fallback function)
    //     // call (forwards all of the gas)
    //     payable(target).transfer(msg.value/50);
    //     emit FallbackLog("hi");
    //     console.log("fallback");
    // }

    receive() external payable {
        // send / transfer (forwards 2300 gas to this fallback function)
        // call (forwards all of the gas)
        (bool success) = address(this).balance < 10 ether;
        require(success, "AutoDock is full");

        payable(target).transfer(msg.value/2);
        // target.transfer(msg.value/100);
        emit DepositLog(gasleft());
        console.log("receive");
    }


    // Helper function to check the balance of this contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
    // console.log("target");
    function postUpgrade(string memory prefix) public proxied {
        _prefix = prefix;
    }

    function setTest(string memory _test) public {
        test = string(abi.encodePacked(_prefix, _test));
        emit TestChanged(_test);
    }
}
