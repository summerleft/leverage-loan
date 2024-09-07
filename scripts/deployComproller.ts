import { deployComptroller } from "./comptroller";


// before run this script, modify CompAddress in Comptroller.sol as COMP address
async function main() {
    // deploy
    await deployComptroller()
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });