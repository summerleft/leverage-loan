import { ethers } from "hardhat";

export async function deployUnitroller() {
    const Unitroller = await ethers.getContractFactory("Unitroller");
    const unitrollerDeploy = await Unitroller.deploy();
    console.log("Unitroller deployed to: ", await unitrollerDeploy.getAddress());
}