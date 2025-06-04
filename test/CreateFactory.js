const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CreateFactory", function () {
  async function deployERC20Factory() {
    const CreatorFactory = await ethers.getContractFactory("CreatorFactory");
    const creatorFactory = await CreatorFactory.deploy();

    return { creatorFactory };
  }

  describe("Should deploy a new creator token", function () {
    it("Should deploy a new creator token", async function () {
      const deployFactory = await deployERC20Factory();
      const { creatorFactory } = deployFactory;
      const tokensLengthBefore = await creatorFactory.allTokens();


       const tx = await creatorFactory.createToken("RoopakToken", "RPK", 100);
       await tx.wait();

       const tokensLengthAfter = await creatorFactory.allTokens();


       expect(tokensLengthAfter.length).to.greaterThan(tokensLengthBefore.length);

    });
    it("Should able to deploy multiple token by same creator", async function () {
      const deployFactory = await deployERC20Factory();
      const { creatorFactory } = deployFactory;
      const tokensLengthBefore = await creatorFactory.allTokens();

       const tx1 = await creatorFactory.createToken("RoopakToken1", "RPK1", 100);
       await tx1.wait();

       const tx2 = await creatorFactory.createToken("RoopakToken2", "RPK2", 100);
       await tx2.wait();

       const tokensLengthAfter = await creatorFactory.allTokens();

       expect(tokensLengthAfter.length).to.equal(2);

    });
    it("tokenByCreator[creator] should correctly lists tokens created by the caller", async function () {
      const deployFactory = await deployERC20Factory();
      const { creatorFactory } = deployFactory;
      const [account1, account2] = await ethers.getSigners();

      const account1Address = account1.getAddress();
      const account2Address = account2.getAddress();

       const tx1 = await creatorFactory.connect(account1).createToken("Test1", "T1", 100);
       await tx1.wait();

       const tx2 = await creatorFactory.connect(account1).createToken("Test2", "T2", 100);
       await tx2.wait();

       const tx3 = await creatorFactory.connect(account2).createToken("Test3", "T3", 100);
       await tx3.wait();

      const getTokensByAccount1 = await creatorFactory.getTokensByCreator(account1Address);
      const getTokensByAccount2 = await creatorFactory.getTokensByCreator(account2Address);

      console.log(getTokensByAccount2.length);

       expect(getTokensByAccount1.length).to.equal(2);
       expect(getTokensByAccount2.length).to.equal(1);

    });
    it("tokenMetadata[tokenAddress] should contain the correct name and symbol.", async function () {
      const deployFactory = await deployERC20Factory();
      const { creatorFactory } = deployFactory;
   

       const tx1 = await creatorFactory.createToken("Test1", "T1", 100);
       await tx1.wait();

       const tokensAddress = await creatorFactory.allTokens();
       console.log('token address', tokensAddress[0]);

       const tokenMetaData = await creatorFactory.tokenMetadata(tokensAddress[0]);
        console.log("tokenMetaData",tokenMetaData );

        expect(tokenMetaData.name).to.equal("Test1");
        expect(tokenMetaData.symbol).to.equal("T1");
        expect(tokenMetaData.tokenAddress).to.equal(tokensAddress[0]);
        

    });
    it("should emit an event on successful token creation", async function(){
      const { creatorFactory } = await loadFixture(deployERC20Factory);

      await expect(creatorFactory.createToken("Test1", "T1", 100))
      .to.emit(creatorFactory, "tokenDeployed")
      .withArgs(anyValue, anyValue, "Test1", "T1" );
    })
    it("should limit the token by a particular creator to 5", async function(){
      const { creatorFactory } = await loadFixture(deployERC20Factory);

      for (let i = 0; i < 5; i++) {
        await creatorFactory.createToken(`Token${i}`, `TK${i}`, 100);
      }

      const tokens = await creatorFactory.allTokens();
      console.log("token length",tokens.length );
      expect(tokens.length).to.equal(5);


      await expect(creatorFactory.createToken("Test6", "T6", 100))
      .revertedWith("Token creation limit reached");
    })

    it("should revert back if same token name is used", async function(){
      const deployFactory = await deployERC20Factory();
      const { creatorFactory } = deployFactory;

      const tx = await creatorFactory.createToken("Test1", "T1", 100);
      
      await expect(creatorFactory.createToken("Test1", "T2", 100))
      .revertedWith("Token name already used");
    })

    it("should revert back if same token symbol is used", async function(){
      const deployFactory = await deployERC20Factory();
      const { creatorFactory } = deployFactory;

      const tx = await creatorFactory.createToken("Test1", "T2", 100);
      
      await expect(creatorFactory.createToken("Test2", "T2", 100))
      .revertedWith("Token symbol already used");
    })

   
  });

  describe("should revert back if token data not provided", function(){
    it("should revert back if name of token not provided", async function(){
      const { creatorFactory } = await loadFixture(deployERC20Factory);

      await expect(creatorFactory.createToken("", "T1", 100)).revertedWith("Token name cannot be empty");
    })
    it("should revert back if symbol of token not provided", async function(){
      const { creatorFactory } = await loadFixture(deployERC20Factory);

      await expect(creatorFactory.createToken("Test", "", 100)).revertedWith("Token symbol cannot be empty");
    })
    it("should revert back if intial supply not provided", async function(){
      const { creatorFactory } = await loadFixture(deployERC20Factory);

      await expect(creatorFactory.createToken("Test", "T1", 0)).revertedWith("Initial supply cannot be empty");
    })
  })

  
 
});
