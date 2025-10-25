import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const PUSH_RPC = process.env.PUSH_RPC ?? "https://rpc.pushchain.org";
const PUSH_CHAIN_ID = Number(process.env.PUSH_CHAIN_ID ?? 12345);
const PRIVATE_KEY = process.env.DEPLOYER_KEY ?? "";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    push: {
      url: PUSH_RPC,
      chainId: PUSH_CHAIN_ID,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: { push: process.env.PUSH_EXPLORER_KEY ?? "" },
    customChains: [
      {
        network: "push",
        chainId: PUSH_CHAIN_ID,
        urls: {
          apiURL: "https://explorer.pushchain.org/api",
          browserURL: "https://explorer.pushchain.org",
        },
      },
    ],
  },
};

export default config;