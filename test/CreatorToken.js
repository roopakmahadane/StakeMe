const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const { ethers } = require("hardhat");


  describe("Create Token", function(){
    async function deployWithFactoryAndGetToken() {
        const [deployer, backendSigner, follower] = await ethers.getSigners();
      
        const Factory = await ethers.getContractFactory("CreatorFactory");
        const factory = await Factory.deploy(backendSigner.address);
        await factory.createToken("TestToken", "TTK");
      
        const [tokenAddress] = await factory.allTokens();
        const Token = await ethers.getContractFactory("CreatorToken");
        const token = await Token.attach(tokenAddress);
      
        return { factory, token, backendSigner, deployer, follower };
      }

      it("should mint tokens with valid signature", async () => {
        const { token, backendSigner, follower } = await loadFixture(deployWithFactoryAndGetToken);
      
        const amount = 5;
        const pricePerToken = ethers.parseEther("0.01"); // 0.01 ETH
        const expiry = Math.floor(Date.now() / 1000) + 3600; // valid for 1 hour
      
        // 1. Prepare message hash

        
        const tokenAddress = await token.getAddress();
        const followerAddress = await follower.getAddress();

        console.log("token address",tokenAddress);
        console.log("followerAddress",followerAddress);

        const messageHash = ethers.solidityPackedKeccak256(
          ["address", "address", "uint256", "uint256", "uint256"],
          [tokenAddress, followerAddress, amount, pricePerToken, expiry]
        );
        console.log("messageHash", messageHash);

        // 2. Convert to Ethereum signed message hash
        const ethSignedMessageHash = ethers.hashMessage(ethers.toBeArray(messageHash));
        console.log("ethSignedMessageHash", ethSignedMessageHash)
      
        // 3. Sign it with backend signer
        const signature = await backendSigner.signMessage(ethers.toBeArray(messageHash));
      
        // 4. Call mintWithSignature from follower
        const totalValue = pricePerToken*BigInt(amount);
        const tx = await token.connect(follower).mintWithSignature(
          amount,
          pricePerToken,
          expiry,
          signature,
          { value: totalValue }
        );
      
        await tx.wait();
      
        // 5. Assert token balance
        const balance = await token.balanceOf(follower.address);
        expect(balance).to.equal(ethers.parseUnits(amount.toString(), 18));
      });

      it("should revert if the signature is expired", async () => {
        const { token, backendSigner, follower } = await loadFixture(deployWithFactoryAndGetToken);
      
        const amount = 5;
        const pricePerToken = ethers.parseEther("0.01");
        const expiry = Math.floor(Date.now() / 1000) - 100; // Already expired
      
        const tokenAddress = await token.getAddress();
        const followerAddress = await follower.getAddress();
      
        const messageHash = ethers.solidityPackedKeccak256(
          ["address", "address", "uint256", "uint256", "uint256"],
          [tokenAddress, followerAddress, amount, pricePerToken, expiry]
        );
      
        const signature = await backendSigner.signMessage(ethers.toBeArray(messageHash));
      
        const totalValue = pricePerToken * BigInt(amount);
      
        await expect(
          token.connect(follower).mintWithSignature(amount, pricePerToken, expiry, signature, {
            value: totalValue,
          })
        ).to.be.revertedWith("Signature expired");
      });

      it("should revert if the signature is not from the backend signer", async () => {
        const { token, follower } = await loadFixture(deployWithFactoryAndGetToken);
        const [, , ,fakeSigner] = await ethers.getSigners();
      
        const amount = 5;
        const pricePerToken = ethers.parseEther("0.01");
        const expiry = Math.floor(Date.now() / 1000) + 3600;
      
        const tokenAddress = await token.getAddress();
        const followerAddress = await follower.getAddress();
      
        const messageHash = ethers.solidityPackedKeccak256(
          ["address", "address", "uint256", "uint256", "uint256"],
          [tokenAddress, followerAddress, amount, pricePerToken, expiry]
        );
      
        const signature = await fakeSigner.signMessage(ethers.toBeArray(messageHash));
        const totalValue = pricePerToken * BigInt(amount);
      
        await expect(
          token.connect(follower).mintWithSignature(amount, pricePerToken, expiry, signature, {
            value: totalValue,
          })
        ).to.be.revertedWith("Invalid signature");
      });

      it("should revert if the payment is less than required", async () => {
        const { token, backendSigner, follower } = await loadFixture(deployWithFactoryAndGetToken);
      
        const amount = 5;
        const pricePerToken = ethers.parseEther("0.01");
        const expiry = Math.floor(Date.now() / 1000) + 3600;
      
        const tokenAddress = await token.getAddress();
        const followerAddress = await follower.getAddress();
      
        const messageHash = ethers.solidityPackedKeccak256(
          ["address", "address", "uint256", "uint256", "uint256"],
          [tokenAddress, followerAddress, amount, pricePerToken, expiry]
        );
      
        const signature = await backendSigner.signMessage(ethers.toBeArray(messageHash));
      
        // Send less than required ETH
        const underPaid = pricePerToken * BigInt(amount - 1);
      
        await expect(
          token.connect(follower).mintWithSignature(amount, pricePerToken, expiry, signature, {
            value: underPaid,
          })
        ).to.be.revertedWith("Insufficient payment");
      });
      
      it("should allow minting multiple times with different valid signatures", async () => {
        const { token, backendSigner, follower } = await loadFixture(deployWithFactoryAndGetToken);
      
        const tokenAddress = await token.getAddress();
        const followerAddress = await follower.getAddress();
      
        for (let i = 0; i < 3; i++) {
          const amount = 2 + i;
          const pricePerToken = ethers.parseEther("0.01");
          const expiry = Math.floor(Date.now() / 1000) + 3600;
      
          const messageHash = ethers.solidityPackedKeccak256(
            ["address", "address", "uint256", "uint256", "uint256"],
            [tokenAddress, followerAddress, amount, pricePerToken, expiry]
          );
      
          const signature = await backendSigner.signMessage(ethers.toBeArray(messageHash));
          const totalValue = pricePerToken * BigInt(amount);
      
          await token.connect(follower).mintWithSignature(
            amount, pricePerToken, expiry, signature,
            { value: totalValue }
          );
        }
      
        const balance = await token.balanceOf(followerAddress);
        expect(balance).to.equal(ethers.parseUnits("9", 18)); // 2 + 3 + 4
      });

      it("should transfer ETH to the token owner after mint", async () => {
        const { token, backendSigner, follower, deployer } = await loadFixture(deployWithFactoryAndGetToken);
      
        const amount = 5;
        const pricePerToken = ethers.parseEther("0.01");
        const expiry = Math.floor(Date.now() / 1000) + 3600;
        const totalValue = pricePerToken * BigInt(amount);
      
        const tokenAddress = await token.getAddress();
        const followerAddress = await follower.getAddress();
      
        const messageHash = ethers.solidityPackedKeccak256(
          ["address", "address", "uint256", "uint256", "uint256"],
          [tokenAddress, followerAddress, amount, pricePerToken, expiry]
        );
        const signature = await backendSigner.signMessage(ethers.toBeArray(messageHash));
      
        const oldBalance = await ethers.provider.getBalance(deployer.address);
      
        const tx = await token.connect(follower).mintWithSignature(
          amount, pricePerToken, expiry, signature, { value: totalValue }
        );
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
        const newBalance = await ethers.provider.getBalance(deployer.address);
        expect(newBalance).to.be.greaterThan(oldBalance);
      });
      
  }

)