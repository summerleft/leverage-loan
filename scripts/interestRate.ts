import { ethers } from "hardhat";
import { parseUnits, parseEther } from "ethers";

const JumpRateModelV2Name = "JumpRateModelV2";
const whitePaperInterestRateModelName = "WhitePaperInterestRateModel";

export const deployJumpRateModelV2 = async (owner: string) => {
    const JumpRateModelV2 = await ethers.getContractFactory(JumpRateModelV2Name);
    const jumpRateModelV2 = await JumpRateModelV2.deploy(
        parseUnits("0.1"),
        parseEther("0.07"), 
        parseEther("3"), 
        parseEther("0.8"), 
        owner
    );
    console.log('jumpRateModelV2 deployed to: ', await jumpRateModelV2.getAddress())
}


export const deployWhitePaperInterestRateModel = async () => {
    const WhitePaperInterestRateModel = await ethers.getContractFactory(whitePaperInterestRateModelName);
    const whitePaperInterestRateModel = await WhitePaperInterestRateModel.deploy(
        parseUnits("0.1"),
        parseEther("0.07"),
    );
    console.log('whitePaperInterestRateModel deployed to: ', await whitePaperInterestRateModel.getAddress())
}