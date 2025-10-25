import { expect } from "chai";
import { ethers } from "hardhat";

describe("uUSD", function () {
  it("Should mint and burn", async function () {
    const uUSD = await ethers.getContractFactory("uUSD");
    const contract = await uUSD.deploy();
    await contract.waitForDeployment();

    const [owner] = await ethers.getSigners();
    await contract.mint(owner.address, 1000);
    expect(await contract.balanceOf(owner.address)).to.equal(1000);

    await contract.burn(owner.address, 500);
    expect(await contract.balanceOf(owner.address)).to.equal(500);
  });
});