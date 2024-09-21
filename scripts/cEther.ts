import { ethers } from "hardhat";
import { parseEther } from "ethers";

export const cEther__setReserveFactor = async (CEtherAddress: string) => {
    const cEther = await ethers.getContractAt("CErc20Delegator",CEtherAddress);
    await cEther._setReserveFactor(parseEther("0.2"));
    console.log("cEther__setReserveFactor success");
}