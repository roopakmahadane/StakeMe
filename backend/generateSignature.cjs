const express = require("express");
const bodyParser = require("body-parser");
const { ethers } = require("ethers");
require("dotenv").config();
const cors = require('cors');

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

    console.log({
      tokenAddress,
      userAddress,
      purchaseAmount,
      pricePerToken,
      expiry
    });
    

    if (!tokenAddress || !userAddress || !purchaseAmount || !pricePerToken || !expiry) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "address", "uint256", "uint256", "uint256"],
      [tokenAddress, userAddress, purchaseAmount, pricePerToken, expiry]
    );

    const signature = await signer.signMessage(ethers.toBeArray(messageHash));
    console.log("signature", res.json({ signature }));
    res.json({ signature });
  } catch (error) {
    console.error("Signature error:", error);
    res.status(500).json({ error: "Failed to generate signature" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Signature server running on port ${PORT}`));
