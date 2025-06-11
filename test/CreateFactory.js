const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CreateFactory", function () {
  async function deployERC20Factory() {
    const [deployer, backendSigner] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    const backendSignerAddress = await backendSigner.getAddress();

    const CreatorFactory = await ethers.getContractFactory("CreatorFactory");
    const creatorFactory = await CreatorFactory.deploy(backendSignerAddress);

    await creatorFactory.waitForDeployment();

    return { creatorFactory,backendSigner, backendSignerAddress,deployer, deployerAddress };
  }

  describe("Should deploy a new creator token", function () {

    it("should set backendSigner correctly", async function(){
      const deployFactory = await deployERC20Factory();
      const { creatorFactory, backendSignerAddress } = deployFactory;
      expect(await creatorFactory.backendSigner()).to.equal(backendSignerAddress);

    })

    it("Creator token array should be empty", async function(){
      const { creatorFactory } = await loadFixture(deployERC20Factory);
      const tokenArray = await creatorFactory.allTokens()
      expect(tokenArray.length).to.equal(0);
    })

    it("should deploy token with valid input", async function(){
      const { creatorFactory } = await loadFixture(deployERC20Factory);
      const tx = await creatorFactory.createToken("RoopakToken", "RPK");
      await tx.wait();
      const tokenArray = await creatorFactory.allTokens()
      const tokenAddress = tokenArray[0];
      const tokenMetaData = await creatorFactory.tokenMetadata(tokenAddress);
       expect(tokenMetaData.name).to.equal("RoopakToken");
      expect(tokenMetaData.symbol).to.equal("RPK");
    })

    it("should emit an event on successful token creation", async function(){
          const { creatorFactory } = await loadFixture(deployERC20Factory);
    
          await expect(creatorFactory.createToken("Test1", "T1"))
          .to.emit(creatorFactory, "tokenDeployed")
          .withArgs(anyValue, anyValue, "Test1", "T1" );
        })

    it("tokenByCreator[creator] should correctly list tokens created by the caller", async function () {
      const deployFactory = await deployERC20Factory();
      const { creatorFactory } = deployFactory;
      const [account] = await ethers.getSigners();
      const accountAddress = await account.getAddress();
       const tx = await creatorFactory.connect(account).createToken("Test1", "T1");
       await tx.wait();
      const tokenMetaData = await creatorFactory.getTokenByCreator(accountAddress);
       expect(tokenMetaData.name).to.equal("Test1");
       expect(tokenMetaData.symbol).to.equal("T1");

    });
 
    it("should revert back if same profile creates another token", async function(){
      const deployFactory = await deployERC20Factory();
      const { creatorFactory } = deployFactory;

      const tx = await creatorFactory.createToken("Test1", "T1");
      
      await expect(creatorFactory.createToken("Test1", "T2"))
      .revertedWith("Token already created");
    })

    it("should revert back if same token name is used", async function(){
      const deployFactory = await deployERC20Factory();
      const { creatorFactory } = deployFactory;
      const[signer1, signer2] = await ethers.getSigners();

      const tx = await creatorFactory.connect(signer1).createToken("Test1", "T1");
      
      await expect(creatorFactory.connect(signer2).createToken("Test1", "T2"))
      .revertedWith("Token name already used");
    })

    it("should revert back if same token symbol is used", async function(){
      const deployFactory = await deployERC20Factory();
      const { creatorFactory } = deployFactory;
      const[signer1, signer2] = await ethers.getSigners();

      const tx = await creatorFactory.connect(signer1).createToken("Test1", "T1");
      
      await expect(creatorFactory.connect(signer2).createToken("Test2", "T1"))
      .revertedWith("Token symbol already used");
    })

    it("should revert back if name of token not provided", async function(){
      const { creatorFactory } = await loadFixture(deployERC20Factory);

      await expect(creatorFactory.createToken("", "T1")).revertedWith("Token name cannot be empty");
    })
    it("should revert back if symbol of token not provided", async function(){
      const { creatorFactory } = await loadFixture(deployERC20Factory);

      await expect(creatorFactory.createToken("Test", "")).revertedWith("Token symbol cannot be empty");
    })
    it("Token name/symbol uniqueness should be case-sensitive",async function(){
      const { creatorFactory } = await loadFixture(deployERC20Factory);
      const[signer1, signer2] = await ethers.getSigners();

      const tx1= await creatorFactory.connect(signer1).createToken("Roopak", "T1");
      const tx2= await creatorFactory.connect(signer2).createToken("roopak", "t1");

      const tokenArray = await creatorFactory.allTokens()
      expect(tokenArray.length).to.equal(2);

    })
    it("allTokens() should return all deployed token addresses",async function(){
      const { creatorFactory } = await loadFixture(deployERC20Factory);
      const[signer1, signer2] = await ethers.getSigners();

      const tx1= await creatorFactory.connect(signer1).createToken("Roopak", "T1");
      const tx2= await creatorFactory.connect(signer2).createToken("roopak", "t1");

      const tokenArray = await creatorFactory.allTokens()
      expect(tokenArray.length).to.equal(2);

    })
  
  })


});

