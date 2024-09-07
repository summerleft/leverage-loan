import { deployComp } from "./comp";
import { deployUnitroller } from "./unitroller";
import { deployComptroller } from "./comptroller";
import { deploySimplePriceOracle } from "./priceOracle";

async function main() {
    // deploy
    await deployComp()
    await deployUnitroller()
    await deployComptroller()
    await deploySimplePriceOracle()
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });