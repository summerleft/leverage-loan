// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./interfaces/ILeverageLoan.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ERC20/ERC20Token.sol";
import "./compoundv2/CErc20Delegator.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3SwapCallback.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./compoundv2/Comptroller.sol";
import "./lib/SafeInt256.sol";
import "./lib/SafeCast.sol";

contract LeverageLoan is Initializable, ILeverageLoan, IUniswapV3SwapCallback, Ownable {

    using Math for uint256;
    using SafeInt256 for int256;
    using SafeCast for uint256;
    address private proxy;
    mapping(address => uint256) public userUSDCBalances;
    mapping(address => uint256) public userUSDCAmount;

    // put same types together
    address public constant mockUSDCAddress = 0xAB108f5D01e93151c4B314cb3Abc399Fa6aFE3c2; // MOCK_USDC_ADDRESS 
    address public constant mockWETHAddress = 0xeE4EdaAe4439703982df8B91E0FE040dFC3dD054;
    address public constant cUSDCAddress = 0xEdD770985B060193101eE560857694a8eA1CA335; // proxy contract
    address public constant cWETHAddress = 0xA9B77139A56e06f478feFFBbb34969fD48827449; // proxy contract
    address public constant uniswapV3PoolAddress = 0x49faF3Bdb95862c0777795b6Ce62bD79b8b567Fe;
    address public constant compoundComptrollerAddress = 0xde775B530AF01F0a2211026300805f36dC03A58E;

    // initialize contract
    ERC20 usdc = ERC20(mockUSDCAddress);
    ERC20 weth = ERC20(mockWETHAddress);
    CErc20Delegator cUSDC = CErc20Delegator(payable(cUSDCAddress));
    CErc20Delegator cWETH = CErc20Delegator(payable(cWETHAddress));
    Comptroller comptroller = Comptroller(compoundComptrollerAddress);

    mapping(address => Position) public positions;  // map user to position

    constructor() Ownable(msg.sender) {}

    function initialize(address _owner) external initializer {
        transferOwnership(_owner);
    }

    function deposit(uint256 amount) external {
        if (amount <= 0) {
            revert("Amount must be greater than 0");
        }
        if (!usdc.transferFrom(msg.sender, address(this), amount)) {
            revert("Transfer failed");
        }
        userUSDCBalances[msg.sender] += amount;
    }

    function withdraw(uint256 amount) external {
        if (amount <= 0) {
            revert("Amount must be greater than 0");
        }
        if (userUSDCBalances[msg.sender] < amount) {
            revert("Insufficient balance");
        }
        userUSDCBalances[msg.sender] -= amount;
        if (!usdc.transfer(msg.sender, amount)) {
            revert("Transfer failed");
        }
    }

    // user pay USDC for ETH
    function goLong(address user, uint256 amount, uint256 leverage, uint256 priceLimit) external {
        if (userUSDCBalances[user] < amount) {
            revert("Insufficient USDC balance in contract");
        }
        if (positions[user].isOpen) {
            revert("Cannot open long now");
        }

        userUSDCBalances[user] -= amount;
        userUSDCAmount[user] += amount;
        uint256 maxLeverage = _calculateMaxLeverage();
        if (leverage <= 0 || leverage >= maxLeverage) {
            revert("Leverage is invalid");
        }

        uint256 spendUSDCAmount = amount * (1 + leverage);
        IUniswapV3Pool(uniswapV3PoolAddress).swap(
            address(this),
            false, // token1 for token0
            int256(spendUSDCAmount), // plus means pay token1
            uint160(Math.sqrt(priceLimit)),
            ""
        );

        positions[user] = Position({
            amount: amount,
            leverage: leverage,
            entryPrice: amount,
            isOpen: true,
            isLong: true
        });
    }

    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external {
        // 开多：swap USDC(token0) for WETH(token1): amount0Delta > 0, amount1Delta < 0
        // 平多：swap WETH(token1) for USDC(token0): amount0Delta < 0, amount1Delta > 0
        // 开空：swap WETH(token1) for USDC(token0): amount0Delta < 0, amount1Delta > 0
        // 平空：swap USDC(token0) for WETH(token1): amount0Delta > 0, amount1Delta < 0
        if (amount0Delta > 0) {
            uint256 collateralWETH = uint256(-amount1Delta); // amount1Delta: weth

            // collateral weth
            if (!weth.approve(cWETHAddress, collateralWETH)) {
                revert("Approve WETH failed");
            }
            if (cWETH.mint(collateralWETH) != 0) {
                revert("cWETH mint failed");
            }

            // borrow USDC
            if (cUSDC.borrow(uint256(amount0Delta)) != 0) {
                revert("Borrow USDC failed");
            }

            // transfer to uniswap
            if (!usdc.transfer(msg.sender, uint256(amount0Delta))) {
                revert("Transfer USDC failed");
            }
        } else if (amount1Delta > 0) {
            // pay wETH, get USDC
            uint256 collateralUSDC = uint256(-amount0Delta);

            // Collateral USDC
            if (!usdc.approve(cUSDCAddress, collateralUSDC)) {
                revert("Approve USDC failed");
            }
            if (cUSDC.mint(collateralUSDC) != 0) {
                revert("cUSDC mint failed");
            }

            // Borrow WETH
            if (cWETH.borrow(uint256(amount1Delta)) != 0) {
                revert("Borrow WETH failed");
            }

            // Transfer WETH to Uniswap
            if (!weth.transfer(msg.sender, uint256(amount1Delta))) {
                revert("Transfer WETH failed");
            }
        }
    }

    // open short
    function goShort(address user, uint256 amount, uint256 leverage, uint256 priceLimit) external {
        if (userUSDCBalances[user] < amount) {
            revert("Insufficient USDC balance in contract");
        }
        if (positions[user].isOpen) {
            revert("Cannot open short now");
        }

        userUSDCBalances[user] -= amount;
        userUSDCAmount[user] = amount;
        uint256 maxLeverage = _calculateMaxLeverage();
        if (leverage <= 0 || leverage >= maxLeverage) {
            revert("Leverage is invalid");
        }

        // usdc.approve(address(cUSDC), userUSDCBalances[user]);
        // if (cUSDC.mint(userUSDCBalances[user]) != 0) {
        //     revert("Compound mint failed");
        // }

        // if (cWETH.borrow(amount) != 0) {
        //     revert("Borrow WETH failed");
        // }

        IUniswapV3Pool(uniswapV3PoolAddress).swap(
            address(this),
            false,  // swap WETH(token1) for USDC(token0)
            int256(amount * (1 + leverage)), // get USDC(token0)
            uint160(Math.sqrt(priceLimit)),
            abi.encode(amount)
        );

        positions[user] = Position({
            amount: amount,
            leverage: leverage,
            entryPrice: 0, // todo
            isOpen: true,
            isLong: false
        });
    }

    function closeLong(address user) external {
        // check position
        if (!positions[user].isOpen || !positions[user].isLong) {
            revert("No open long position to close");
        }
        uint256 usdcAmount = positions[user].amount * positions[user].leverage;
        if (!usdc.approve(uniswapV3PoolAddress, usdcAmount)) {
            revert("Approve USDC for swap failed");
        }

        IUniswapV3Pool(uniswapV3PoolAddress).swap(
            address(this),
            true, // token1 for token0 (WETH for USDC)
            -int256(usdcAmount), // negative means receive token0 (USDC)
            0, // no price limit
            ""
        );
        int256 profitOrLoss = calculateProfitAndLoss(user);
        userUSDCBalances[user] += profitOrLoss.toUint256();
        positions[user].isOpen = false;
    }

    function closeShort(address user) external {
        if (!positions[user].isOpen || positions[user].isLong) {
            revert("No open short position to close");
        }

        uint256 usdcAmount = positions[user].amount * positions[user].leverage;
        if (!usdc.approve(uniswapV3PoolAddress, usdcAmount)) {
            revert("Approve USDC for swap failed");
        }

        IUniswapV3Pool(uniswapV3PoolAddress).swap(
            address(this),
            false, // token0 for token1 (USDC for WETH)
            int256(usdcAmount), // positive means pay token0 (USDC)
            0, // no price limit
            ""
        );

        int256 profitOrLoss = calculateProfitAndLoss(user);
        userUSDCBalances[user] += profitOrLoss.toUint256();
        positions[user].isOpen = false;
    }

    // get current profit or loss
    function calculateProfitAndLoss(address user) public view returns (int256) {
        // get current position
        Position memory position = positions[user];
        if (!position.isOpen) {
            return 0;
        }

        // Fetch the current price of WETH in terms of USDC
        uint256 currentPrice = getCurrentPrice();

        // Calculate the current value of the position
        uint256 currentValue;
        if (position.isLong) {
            currentValue = (position.amount * position.leverage * currentPrice) / 1e18;
        } else {
            currentValue = (position.amount * position.leverage * 1e18) / currentPrice;
        }

        // Calculate the initial value of the position
        uint256 initialValue = position.amount * position.leverage;

        // Calculate profit or loss
        // todo safe cas
        if (position.isLong) {
            return currentValue.toInt256() - initialValue.toInt256();
        } else {
            return initialValue.toInt256() - currentValue.toInt256();
        }
    }

    // get current price from Uniswap or oracle
    function getCurrentPrice() public view returns (uint256) {
        // current Uniswap price
        (uint160 sqrtPriceX96, , , , , , ) = IUniswapV3Pool(uniswapV3PoolAddress).slot0();
        uint256 currentPrice = (uint256(sqrtPriceX96) * uint256(sqrtPriceX96)) / (2**192);

        (uint256 wethCollateralFactor, , , ) = cWETH.getAccountSnapshot(address(this)); // WETH 抵押率
        (uint256 usdcCollateralFactor, , , ) = cUSDC.getAccountSnapshot(address(this)); // USDC 抵押率

        // 获取用户的持仓信息
        Position memory position = positions[msg.sender];
        uint256 usdcAmount = position.amount * position.leverage;

        // 根据用户的持仓状态计算平仓价值
        if (position.isLong) {
            // 如果是开多，计算当前平仓能够获取的 USDC
            // 使用 WETH 的抵押率
            uint256 collateralValue = (usdcAmount * wethCollateralFactor) / 1e18; // 当前持仓的价值
            uint256 currentValue = (usdcAmount * currentPrice) / 1e18; // 当前市场价值
            return currentValue + collateralValue; // 返回当前市场价值
        } else {
            // 如果是开空，计算当前平仓能够获取的 USDC
            // 使用 USDC 的抵押率
            uint256 collateralValue = (usdcAmount * usdcCollateralFactor) / 1e18; // 计算可用的抵押品价值
            return collateralValue; // 返回可用的 USDC
        }
    }

    function calculateMaxLeverage() external view returns (uint256) {
        return _calculateMaxLeverage();
    }
    // debug hardhat
    function _calculateMaxLeverage() internal view returns (uint256) {
        // decimals
        // floor
        // get current WETH/USDC price
        (uint160 sqrtPriceX96, , , , , , ) = IUniswapV3Pool(uniswapV3PoolAddress).slot0();
        uint256 wethPrice = uint256(sqrtPriceX96) * uint256(sqrtPriceX96) / (2**192);

        // cWETH collateral factory
        (uint256 collateralFactor, , , ) = cWETH.getAccountSnapshot(address(this));

        // cUSDC borrow rate
        uint256 borrowRate = cUSDC.borrowRatePerBlock(); // 获取 cUSDC 借出利率

        // Uniswap V3 fee
        uint256 uniswapFee = 3000;
        uint256 feeMultiplier = 1e6;

        uint256 borrowableUSDC = (collateralFactor * wethPrice) / (1e18 * borrowRate * (1 + (uniswapFee / feeMultiplier)));
        uint256 userUSDC = userUSDCAmount[msg.sender];
        uint256 maxLeverage = (borrowableUSDC + userUSDC) / (wethPrice * collateralFactor / 1e18) - 1;

        return maxLeverage;
    }
}