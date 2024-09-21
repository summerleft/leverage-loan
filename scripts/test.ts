import { ethers } from "hardhat";
// import { deployJumpRateModelV2, deployWhitePaperInterestRateModel } from "./interestRate";
import { unitroller__setPendingImplementation } from "./unitroller";
import { comptroller__become } from "./comptroller";
import { erc20TokenDeploy, cErc20DelegatorDeploy, CErc20DelegateDeploy, erc20ETHDeploy, cETHDelegatorDeploy } from "./cToken";

const unitrollerAddress = '0xb172B73506200f8a2FdAE0E0b9d10312D41BD0e4'
const comptrollerAddress = '0xde775B530AF01F0a2211026300805f36dC03A58E'
// const simplePriceOracleAddress = '0x8bdAf25F2D6F52f63d0724D0b3C11914EbD9bFfA'
const JumpRateModelV2Address = '0xcE38BA25f2CE2f43Ff2a570EB29a417Bf00da23E'

async function main() {
    const signer = await ethers.provider.getSigner();
    const owner = await signer.getAddress();

    // await unitroller__setPendingImplementation(unitrollerAddress, comptrollerAddress)
    // await comptroller__become(comptrollerAddress, unitrollerAddress)
    
    // deploy
    // await deployComp()
    // await deployUnitroller()
    // await deployComptroller()
    // await deploySimplePriceOracle()

    // interest rate
    // await deployJumpRateModelV2(owner)
    // await deployWhitePaperInterestRateModel()

    // // erc20 token
    // const erc20TokenAddress = await erc20TokenDeploy(owner)
    // // ctoken logical contract 
    // const CErc20DelegateAddress = await CErc20DelegateDeploy()
    // // cERC20token proxy contract
    // const CErc20DelegatorAddress = await cErc20DelegatorDeploy(
    //     erc20TokenAddress,
    //     comptrollerAddress,
    //     JumpRateModelV2Address,
    //     owner,
    //     CErc20DelegateAddress,
    //     'COMP USD',
    //     'cUSD'
    // )
    // console.log('delegatorAddress: ', CErc20DelegatorAddress)

    // mock ETH Deploy
    const erc20ETHAddress = await erc20ETHDeploy(owner)
    const CErc20ETHDelegateAddress = await CErc20DelegateDeploy()
    const CErc20ETHDelegatorAddress = await cETHDelegatorDeploy(
        erc20ETHAddress,
        comptrollerAddress,
        JumpRateModelV2Address,
        owner,
        CErc20ETHDelegateAddress,
        'COMP ETH',
        'cETH'
    )
    console.log('ETH delegator address: ', CErc20ETHDelegatorAddress)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });