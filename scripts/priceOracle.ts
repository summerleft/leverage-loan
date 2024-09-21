import { Signer } from "ethers";
import { ethers } from "hardhat";

const COMPTROLLER_NAME = 'Comptroller'
const SIMPLE_PRICE_ORACLE_NAME = 'SimplePriceOracle'

export async function deploySimplePriceOracle() {
    const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle");
    const simplePriceOracleDeploy = await SimplePriceOracle.deploy();
    console.log("SimplePriceOracle deployed to: ", await simplePriceOracleDeploy.getAddress());
}

// 设置预言机
export const comptroller__setPriceOracle = async (comptrollerAddress: string, simplePriceOracleAddress: string) => {
    const comptroller = await ethers.getContractAt(COMPTROLLER_NAME, comptrollerAddress);
    await comptroller._setPriceOracle(simplePriceOracleAddress);
    console.log("comptroller__setPriceOracle success");
}

// 设置预言机价格
export const simplePriceOracle__setUnderlyingPrice = async (signer: Signer, simplePriceOracleAddress: string, cToken: string, underlyingPriceMantissa: bigint) => {
    const oracle = await ethers.getContractAt(SIMPLE_PRICE_ORACLE_NAME, simplePriceOracleAddress, signer)
    await oracle.setUnderlyingPrice(cToken, underlyingPriceMantissa, { gasLimit: 3000000 }).catch(
        err => console.log(err)
    )
    console.log(`simplePriceOracle__setUnderlyingPrice success: ${cToken} is set to ${underlyingPriceMantissa}`)
}