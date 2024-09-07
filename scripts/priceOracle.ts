import { ethers } from "hardhat";

export async function deploySimplePriceOracle() {
    const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle");
    const simplePriceOracleDeploy = await SimplePriceOracle.deploy();
    console.log("SimplePriceOracle deployed to: ", await simplePriceOracleDeploy.getAddress());
}