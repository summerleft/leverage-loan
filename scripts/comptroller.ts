import { parseEther } from "ethers";
import { ethers } from "hardhat";

const COMPTROLLER_NAME = 'Comptroller'

export async function deployComptroller() {
    const Comptroller = await ethers.getContractFactory("Comptroller");
    const comptrollerDeploy = await Comptroller.deploy();
    console.log("Comptroller deployed to: ", await comptrollerDeploy.getAddress());
}

export const comptroller__become = async (comptrollerAddress: string, unitrollerAddress: string) => {
    const comptroller = await ethers.getContractAt(COMPTROLLER_NAME, comptrollerAddress);
    await comptroller._become(unitrollerAddress);
    console.log("comptroller__become success");
}

export const comptroller__setCloseFactor = async (comptrollerAddress: string) => {
    const comptroller = await ethers.getContractAt(COMPTROLLER_NAME, comptrollerAddress);
    await comptroller._setCloseFactor(parseEther('0.5'))
    console.log('comptroller__setCloseFactor success')
}

export const comptroller__setLiquidationIncentive = async (comptrollerAddress: string) => {
    const comptroller = await ethers.getContractAt(COMPTROLLER_NAME, comptrollerAddress);
    await comptroller._setLiquidationIncentive(parseEther('1.08'));
    console.log("ccomptroller__setLiquidationIncentive success");
}

export const comptroller__setPriceOracle = async (comptrollerAddress: string, priceOracleAddress: string) => {
    const comptroller = await ethers.getContractAt(COMPTROLLER_NAME, comptrollerAddress);
    await comptroller._setPriceOracle(priceOracleAddress);
    console.log("comptroller__setPriceOracle success");
}

export const comptroller__setCollateralFactor = async(comptrollerAddress: string, cErc20DelegatorAddress: string, rate?: string) => {
    const comptroller = await ethers.getContractAt(COMPTROLLER_NAME, comptrollerAddress);
    await comptroller._setCollateralFactor(cErc20DelegatorAddress,parseEther(rate ? rate :"0.75"));    
    console.log("comptroller__setCollateralFactor success")
}
