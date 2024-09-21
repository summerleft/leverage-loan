import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from 'dotenv'

import { ProxyAgent, setGlobalDispatcher } from "undici";
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
setGlobalDispatcher(proxyAgent);

dotenv.config()

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
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY || ''],
      timeout: 60000
    }
  },
  etherscan: {
    apiKey: process.env.API_KEY
  }
};

export default config;
