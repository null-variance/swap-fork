const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Sanity checks", function () {
  it("Deploy contract", async function () {
    const Ginseng = await ethers.getContractFactory("Ginseng");
    const gin = await Ginseng.deploy();
    await gin.deployed();

    expect(await gin.name()).to.equal("Ginseng Pool");

    expect(await gin.symbol()).to.equal("GP");

    expect(await gin.decimals()).to.equal(18);

    expect(await gin.totalSupply()).to.equal(BigInt(1e18));
  });

  it("Adding liquidity", async function () {
    const Ginseng = await ethers.getContractFactory("Ginseng");
    const gin = await Ginseng.deploy();
    await gin.deployed();

    // Try adding a token to the pool
    const TokenContract = await ethers.getContractFactory("ERC20");
    const token = await TokenContract.deploy("Test token", "TEST");
    
    // Fail with none allowed
    await expect(gin.maxCanAdd(token.address)).to.be.revertedWith("Not accepting token");
    
    // Can be 0 to 50% of the total supply
    const addTokenTx = await gin.addToken(token.address, 0e7, 50e7);
    await addTokenTx.wait();

    // Fail with not accepting
    await expect(gin.maxCanAdd(token.address)).to.be.revertedWith("Not accepting token");

    const acceptTokenTx = await gin.toggleAccept(token.address);
    await acceptTokenTx.wait();

    const maxToken = await gin.maxCanAdd(token.address);
    expect(maxToken).to.equal(BigInt(1e18/2)); // We can only add until we have half the liquidity
  })
});

/*
expect(await greeter.greet()).to.equal("Hello, world!");

const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

// wait until the transaction is mined
await setGreetingTx.wait();

expect(await greeter.greet()).to.equal("Hola, mundo!");
*/