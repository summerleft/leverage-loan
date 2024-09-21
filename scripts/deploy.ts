import { ethers } from "hardhat";
import { deployComp } from "./comp";
import { deployUnitroller } from "./unitroller";
// import { deployComptroller } from "./comptroller";
import { deploySimplePriceOracle } from "./priceOracle";
import { deployJumpRateModelV2, deployWhitePaperInterestRateModel } from "./interestRate";

async function main() {
    const signer = await ethers.provider.getSigner();
    const owner = await signer.getAddress();

    // deploy
    await deployComp()
    await deployUnitroller()
    // await deployComptroller()
    await deploySimplePriceOracle()

    // interest rate
    await deployJumpRateModelV2(owner)
    await deployWhitePaperInterestRateModel()
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });