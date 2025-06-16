import { calculateCreatorTokenPrice } from "../utils/calculateTokenPrice"
import { useState } from "react"
import launch from '../lotties/launch.json'
import Lottie from "lottie-react";
import StarLayer from "./StarLayer";
import {ethers} from 'ethers';
import CreatorFactory from "../../../artifacts/contracts/CreatorFactory.sol/CreatorFactory.json"
import { useActiveAccount } from "thirdweb/react";
import { useNavigate } from "react-router-dom";

export default function Form(){
const [tokenName, setTokenName] = useState("");
const [tokenSymbol, setSymbol] = useState("");
const [loading, setLoading] = useState(false);

const navigate = useNavigate();
const activeAccount = useActiveAccount();


const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!tokenName || !tokenSymbol) {
      return console.error("Token name or symbol is missing.");
    }
  
    try {
      if (!window.ethereum) {
        return alert("Please install MetaMask to continue.");
      }
  
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
  
      const contract = new ethers.Contract(
        "0x8a7C645B17cfe1D3B345BcaACdCC65d3e08b7Ccb",
        CreatorFactory.abi,
        signer
      );
  
      const tx = await contract.createToken(tokenName, tokenSymbol);
      console.log("Transaction sent, waiting for confirmation...");
      
      const receipt = await tx.wait();
  
      if (receipt.status === 1) {
        console.log("Token created successfully:", receipt);
        setLoading(false);
        const creatorAddress = activeAccount?.address || await signer.getAddress();
        navigate(`/profile/${creatorAddress}`);
      } else {
        setLoading(false);
        console.error("Transaction failed:", receipt);
      }
  
    } catch (error) {
        setLoading(false);
      console.error("Error creating token:", error?.reason || error.message || error);
    }
  };

    return(
        <div className="flex items-center justify-center mt-20 ">
                  <StarLayer />
            <Lottie animationData={launch} loop={true} className="h-90 mx-30 mb-4" />
       <div className="flex flex-col items-center gap-6 p-6 bg-gradient-to-r from-pink-500 to-purple-600 w-2/6 rounded-2xl mr-40 bg-opacity-30 backdrop-blur-md">
        <h1 className="text-3xl font-bold">Launch your Token</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md ">
            <div className="flex flex-col p-5">
                <label className="text-2xl font-bold" htmlFor ="token-name">Name</label>
                <input value={tokenName} placeholder="Token Name" onChange={e => setTokenName(e.target.value)} type="text" id="token-name" className="bg-white text-black w-full rounded-lg p-2 mt-1"/>
            </div>
            <div className="flex flex-col p-5">
                <label className="text-2xl font-bold" htmlFor ="token-symbol">Symbol</label>
                <input value={tokenSymbol}  placeholder="Symbol" onChange={e => setSymbol(e.target.value)} type="text" id="token-symbol" className="bg-white text-black w-full rounded-lg p-2 mt-1"/>
            </div>
            <div className="flex items-center justify-center">
            <button
  disabled={loading || !activeAccount}
  type="submit"
  className={`cursor-pointer mt-2 bg-gradient-to-r from-purple-400 to-pink-500 text-white px-4 py-2 w-[50%] rounded-full font-semibold ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
>
  {loading ? "Launching..." : "Launch!"}
</button>

            </div>
        </form>

       </div>
       </div>
    )
}