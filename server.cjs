const express = require("express");
const bodyParser = require("body-parser");
const { ethers } = require("ethers");
require("dotenv").config();
const cors = require('cors');
const { exec } = require("child_process");

const app = express();
app.use(cors()); 
app.use(bodyParser.json());

const backendPrivateKey = process.env.BACKEND_PRIVATE_KEY;
if (!backendPrivateKey) {
  throw new Error("Missing BACKEND_PRIVATE_KEY in .env");
}

const signer = new ethers.Wallet(backendPrivateKey);

app.post("/api/generate-signature", async (req, res) => {
  try {
    const { tokenAddress, userAddress, purchaseAmount, pricePerToken, expiry } = req.body;


    if (!tokenAddress || !userAddress || !purchaseAmount || !pricePerToken || !expiry) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "address", "uint256", "uint256", "uint256"],
      [tokenAddress, userAddress, purchaseAmount, pricePerToken, expiry]
    );

    const signature = await signer.signMessage(ethers.toBeArray(messageHash));
    return res.json({ signature });
  } catch (error) {
    console.error("Signature error:", error);
   return res.status(500).json({ error: "Failed to generate signature" });
  }
});

app.post("/api/verify", async (req, res) => {
  const { address, constructorArgs } = req.body;

  const argsString = constructorArgs.map(arg =>
    typeof arg === "string" && arg.startsWith("0x") ? arg : `"${arg}"`
  ).join(" ");
  
  const cmd = `npx hardhat verify --network sepolia ${address} ${argsString}`;
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error("Verification error:", stderr);
      return res.status(500).json({ error: stderr });
    }
    console.log("Verification output:", stdout);
    return res.json({ success: true, message: stdout });
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server running on port ${PORT}`));
