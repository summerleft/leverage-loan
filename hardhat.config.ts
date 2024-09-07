import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings:{
					optimizer:{
						enabled: true,
						runs: 200
					}
				}
      },
      {
        version: "0.8.10",
        settings:{
					optimizer:{
						enabled: true,
						runs: 200
					}
				}
      },
      { 
        version: "0.5.16",
        settings:{
					optimizer:{
						enabled: true,
						runs: 200
					}
				}
      },
    ],
  },
  networks: {
    sepolia: {
      url: process.env.PRC_URL,
      accounts: [process.env.PRIVATE_KEY || ''],
      timeout: 60000
    }
  },
  etherscan: {
    apiKey: process.env.API_KEY
  }
};

export default config;
