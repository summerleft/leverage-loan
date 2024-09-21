import { ethers } from "hardhat";

const UNITROLLER_NAME = 'Unitroller'

export async function deployUnitroller() {
    const Unitroller = await ethers.getContractFactory("Unitroller");
    const unitrollerDeploy = await Unitroller.deploy();
    console.log("Unitroller deployed to: ", await unitrollerDeploy.getAddress());
}

export const unitroller__setPendingImplementation = async (unitrollerAddress: string, comptrollerAddress: string) => {
    const unitroller = await ethers.getContractAt(UNITROLLER_NAME, unitrollerAddress);
    await unitroller._setPendingImplementation(comptrollerAddress);
    console.log("unitoller_setPendingImplementation success");
}