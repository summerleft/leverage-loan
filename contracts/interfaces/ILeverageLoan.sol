// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.20;

interface ILeverageLoan {

    struct Position {
        uint256 amount; // amount of the asset in the position
        uint256 leverage; // leverage factor
        uint256 entryPrice; // Price when the position was opened
        bool isOpen; // Position status
        bool isLong; // true if the position is long, false if short
    }

    // open long
    function goLong(address user, uint256 amount, uint256 leverage, uint256 priceLimit) external;

    // open short
    function goShort(address user, uint256 amount, uint256 leverage, uint256 priceLimit) external;

    function closeLong(address user) external;

    function closeShort(address user) external;

    // get current profit or loss
    function calculateProfitAndLoss(address user) external view returns (int256);

    // get current price from Uniswap or oracle
    function getCurrentPrice() external view returns (uint256);

    function calculateMaxLeverage() external returns (uint256);
}