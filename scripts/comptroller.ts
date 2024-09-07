import { ethers } from "hardhat";

export async function deployComptroller() {
    const Comptroller = await ethers.getContractFactory("Comptroller");
    const comptrollerDeploy = await Comptroller.deploy();
    console.log("Comptroller deployed to: ", await comptrollerDeploy.getAddress());
}