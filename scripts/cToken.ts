import { ethers } from "hardhat"
import { parseEther } from "ethers"

const erc20TokenName = "ERC20Token"
const erc20ETHName = "ERC20TokenETH"
const CErc20DelegateName = "CErc20Delegate"
const CErc20DelegatorName = "CErc20Delegator"
const CEtherName = "CEther"

export const erc20TokenDeploy = async (owner: string) => {
    const ERC20Token = await ethers.getContractFactory(erc20TokenName);
    const erc20TokenContract = await ERC20Token.deploy(owner);
    const address = await erc20TokenContract.getAddress()
    console.log('erc20TokenContract deployed at: ', address)
    return address;
}

// cToken logical contract
export const CErc20DelegateDeploy = async () => {
    const CErc20Delegate = await ethers.getContractFactory(CErc20DelegateName);
    const cErc20DelegateContract = await CErc20Delegate.deploy();
    const address = await cErc20DelegateContract.getAddress()
    console.log('cErc20DelegateContract deployed at: ', address)
    return address;
}

// cToken proxy contract
export const cErc20DelegatorDeploy = async (
    erc20Address: string,
    comptrollerAddress: string,
    jumpRateModelV2Address: string,
    owner: string,
    cErc20DelegateAddress: string,
    name: string,
    symbol: string
) => {
    const CErc20Delegator = await ethers.getContractFactory(CErc20DelegatorName);
    const cErc20DelegatorContract = await CErc20Delegator.deploy(
        erc20Address,
        comptrollerAddress,
        jumpRateModelV2Address,
        parseEther("0.1"),
        name,
        symbol,
        "18",
        owner,
        cErc20DelegateAddress,
        "0x"
    );
    const address = await cErc20DelegatorContract.getAddress();
    console.log('cErc20DelegatorContract deployed at: ', address)
    return address;
}

// 部署 cETH
export const cEtherDeploy = async (
    comptrollerAddress: string,
    etherJumpRateModelV2Address: string,
    owner: string
) => {
    const CEther = await ethers.getContractFactory(CEtherName);
    const cEtherContract = await CEther.deploy(
        comptrollerAddress,
        etherJumpRateModelV2Address,
        parseEther("1"),
        "COMPOUND ETH",
        "cETH",
        "18",
        owner
    );
    const address = await cEtherContract.getAddress();
    console.log('cETH deployed at: ', address)
    return address
}

// 代币加入市场
export const cErc20Delegator__supportMarket = async (comptrollerAddress: string, cTokenAddress: string) => {
    const cToken = await ethers.getContractAt("Comptroller", comptrollerAddress);
    await cToken._supportMarket(cTokenAddress);  //  把该token加入到市场中
    console.log("cErc20Delegator_supportMarket success")
}

// set cToken reserve factor
export const cToken__setReserveFactor = async (CErc20DelegatorAddress: string) => {
    const cToken = await ethers.getContractAt("CErc20Delegator", CErc20DelegatorAddress);
    await cToken._setReserveFactor(parseEther("0.1"));
    console.log("cToken__setReserveFactor success");
}

// mock ETH deploy
export const erc20ETHDeploy = async (owner: string) => {
    const ERC20ETH = await ethers.getContractFactory(erc20ETHName);
    const erc20ETHContract = await ERC20ETH.deploy(owner);
    const address = await erc20ETHContract.getAddress()
    console.log('erc20ETHContract deployed at: ', address)
    return address;
}

// mock ETH proxy contract
export const cETHDelegatorDeploy = async (
    erc20Address: string,
    comptrollerAddress: string,
    jumpRateModelV2Address: string,
    owner: string,
    cErc20DelegateAddress: string,
    name: string,
    symbol: string
) => {
    const CErc20Delegator = await ethers.getContractFactory(CErc20DelegatorName);
    const cErc20DelegatorContract = await CErc20Delegator.deploy(
        erc20Address,
        comptrollerAddress,
        jumpRateModelV2Address,
        parseEther("0.1"),
        name,
        symbol,
        "18",
        owner,
        cErc20DelegateAddress,
        "0x"
    );
    const address = await cErc20DelegatorContract.getAddress();
    console.log('cErc20DelegatorContract deployed at: ', address)
    return address;
}