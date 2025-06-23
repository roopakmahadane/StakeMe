const {ethers} = require("ethers");
require('dotenv').config();

const backendPrivateKey = process.env.BACKEND_PRIVATE_KEY;
const signer = new ethers.Wallet(backendPrivateKey);

append.post("/api/generate-signature", async (req, res) => {
    try{
        const { tokenAddress, userAddress, purchaseAmount, pricePerToken, expiry} = req.body;

       
    const messageHash = ethers.solidityPackedKeccak256(
        ["address", "address", "uint256", "uint256", "uint256"],
        [tokenAddress, userAddress, amount, pricePerToken, expiry]
      );
      const signature = await signer.signMessage(ethers.toBeArray(messageHash));
      res.json({ signature });
    }catch(error){
        console.error("Signature error:", error);
    res.status(500).json({ error: "Failed to generate signature" });
    }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Signature server running on port ${PORT}`));