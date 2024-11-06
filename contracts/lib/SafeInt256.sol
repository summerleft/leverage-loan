// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library SafeInt256 {
    function toUint256(int256 value) internal pure returns (uint256) {
        require(value >= 0, "Value must be non-negative");
        return uint256(value);
    }
}