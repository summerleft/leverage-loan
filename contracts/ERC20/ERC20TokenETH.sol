// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20TokenETH is ERC20, ERC20Burnable, Ownable {
    constructor(address owner) ERC20("COMP ETH", "cETH") Ownable(owner) {
        _mint(msg.sender, 100000000000000 * uint(10 ** 18));
    }
}