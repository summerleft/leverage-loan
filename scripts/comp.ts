import { ethers } from 'hardhat'

export async function deployComp() {
    const Comp = await ethers.getContractFactory("Comp");
    const compDeploy = await Comp.deploy(process.env.PUBLIC_KEY);
    console.log("Comp deployed to address: ", await compDeploy.getAddress());
}