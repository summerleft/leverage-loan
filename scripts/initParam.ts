import { ethers } from "hardhat";
import { unitroller__setPendingImplementation } from "./unitroller";
import { comptroller__become, comptroller__setCloseFactor, comptroller__setPriceOracle, comptroller__setCollateralFactor } from "./comptroller";
import { erc20TokenDeploy, CErc20DelegateDeploy, cErc20DelegatorDeploy, cEtherDeploy, cErc20Delegator__supportMarket } from "./cToken";
import { simplePriceOracle__setUnderlyingPrice } from "./priceOracle";
import { parseEther } from "ethers";
import { cToken__setReserveFactor } from "./cToken";
import { cEther__setReserveFactor } from "./cEther"

const unitrollerAddress = '0xb172B73506200f8a2FdAE0E0b9d10312D41BD0e4'
const comptrollerAddress = '0xde775B530AF01F0a2211026300805f36dC03A58E'
const simplePriceOracleAddress = '0x8bdAf25F2D6F52f63d0724D0b3C11914EbD9bFfA'
const JumpRateModelV2Address = '0xcE38BA25f2CE2f43Ff2a570EB29a417Bf00da23E'

async function main() {
    const signer = await ethers.provider.getSigner()
    const owner = await signer.getAddress()

    // set controller proxy
    unitroller__setPendingImplementation(unitrollerAddress, comptrollerAddress)
    comptroller__become(comptrollerAddress, unitrollerAddress)

    // set close factor
    comptroller__setCloseFactor(comptrollerAddress)
    // set liquidation incentive
    comptroller__setCloseFactor(comptrollerAddress)
    // set price oracle
    comptroller__setPriceOracle(comptrollerAddress, simplePriceOracleAddress)

    // erc20 token
    const erc20TokenAddress = await erc20TokenDeploy(owner)
    // ctoken logical contract 
    const CErc20DelegateAddress = await CErc20DelegateDeploy()
    // cERC20token proxy contract
    const CErc20DelegatorAddress = await cErc20DelegatorDeploy(
        erc20TokenAddress,
        comptrollerAddress,
        JumpRateModelV2Address,
        owner,
        CErc20DelegateAddress,
        'COMP USD',
        'cUSD'
    )

    // deploy cETH
    const cEtherAddress = await cEtherDeploy(
        comptrollerAddress,
        JumpRateModelV2Address,
        owner
    )

    // support market
    await cErc20Delegator__supportMarket(comptrollerAddress, CErc20DelegatorAddress)
    await cErc20Delegator__supportMarket(comptrollerAddress, cEtherAddress)
    // set market price(price oracle)
    // cToken(USDC) price
    await simplePriceOracle__setUnderlyingPrice(
        signer,
        simplePriceOracleAddress, 
        CErc20DelegatorAddress, 
        parseEther("1")
    )
    // cETH price
    await simplePriceOracle__setUnderlyingPrice(
        signer,
        simplePriceOracleAddress, 
        cEtherAddress, 
        parseEther('2000')
    )

    // set collateral factor
    await cToken__setReserveFactor(CErc20DelegatorAddress);
    await cEther__setReserveFactor(cEtherAddress);

    // set collateral factor
    await comptroller__setCollateralFactor(
        comptrollerAddress, 
        CErc20DelegatorAddress
    );

    
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });