// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.20;

import './NoDelegateCall.sol';
import '@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol';
import '@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';

contract LeverageLoanFactory is NoDelegateCall, Ownable {
    UpgradeableBeacon public beacon;
    mapping(address => address) public accounts;

    event LeverageLoanCreated(address leverageLoanAddress);

    constructor(address _initialImplementation, address _initialOwner) Ownable(_initialOwner) {
        beacon = new UpgradeableBeacon(_initialImplementation, _initialOwner);
    }

    function createAccount() external noDelegateCall returns (address account) {
        if (accounts[msg.sender] != address(0)) {
            revert("Can't create repeatly");
        }

        bytes memory data = abi.encodeWithSignature("initialize(address)", msg.sender);

        account = address(new BeaconProxy(address(beacon), data));
        accounts[msg.sender] = account;
        emit LeverageLoanCreated(account);
    }

    function getAccount(address user) view external returns (address account) {
        account = accounts[user];
        return account;
    }

    function updateImplementation(address _newImplementation) external onlyOwner {
        beacon.upgradeTo(_newImplementation);
    }
}

