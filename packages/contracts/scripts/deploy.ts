import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const uUSD = await ethers.getContractFactory("uUSD");
  const uUsdContract = await uUSD.deploy();
  await uUsdContract.waitForDeployment();
  console.log("uUSD:", await uUsdContract.getAddress());

  const pool = await ethers.getContractFactory("UnifiedPool");
  const poolContract = await pool.deploy(await uUsdContract.getAddress());
  await poolContract.waitForDeployment();
  console.log("UnifiedPool:", await poolContract.getAddress());

  const oracle = await ethers.getContractFactory("OracleModule");
  const oracleContract = await oracle.deploy();
  await oracleContract.waitForDeployment();
  console.log("OracleModule:", await oracleContract.getAddress());

  const factory = await ethers.getContractFactory("MarketFactory");
  const factoryContract = await factory.deploy(await poolContract.getAddress(), await oracleContract.getAddress());
  await factoryContract.waitForDeployment();
  console.log("MarketFactory:", await factoryContract.getAddress());

  // Grant minter role to BridgeMinter (deploy separately)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});