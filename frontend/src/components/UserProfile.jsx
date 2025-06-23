import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import {MdChevronLeft} from 'react-icons/md';
import {MdChevronRight} from 'react-icons/md';
import CastCardLoader from "./CastCardLoader";
import {ethers} from "ethers"
import CreatorFactory from "../../../artifacts/contracts/CreatorFactory.sol/CreatorFactory.json"
import CreatorToken from "../../../artifacts/contracts/CreatorToken.sol/CreatorToken.json" 
import TokenCard from './TokenCard'
import UserCastCard from './UserCastCard.jsx'
import {calculateCreatorTokenPrice} from '../utils/calculateTokenPrice.js'
import SocialGraph from "./SocialGraph.jsx";
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import Modal from "./Modal.jsx";

export default function UserProfile(){
   const {fid} = useParams();
   const navigate = useNavigate();
   const [user, setUser] = useState(null);
  const [tokenPriceInETH, setTokenPriceInETH] = useState(0);
   const [tokenAvailable, setTokenAvailable] = useState(false)
   const [tokenData, setTokenData] = useState([]);
   const [casts, setCasts] = useState([]);
   const [tokenPrice, setTokenPrice] = useState(0);
  const [isModelOpen, setIsModalOpen] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(0);

   useEffect(() => {

    async function fetchUser() {
        if (!fid) return;
  
        const options = {
          method: "GET",
          headers: {
            "x-api-key":import.meta.env.VITE_NEYNAR_API_KEY,
            "x-neynar-experimental": "false",
          },
        };
  
        try {
          const res = await fetch(
            `https://api.neynar.com/v2/farcaster/user/bulk/?fids=${fid}`,
            options
          );
          const data = await res.json();
          console.log("Raw API response:", data);
          const userData = data["users"][0];
          console.log("userData in Userprofile",userData)
          console.log(userData.verified_addresses.eth_addresses[1])
          if (userData) {
            setUser(userData);
          } else {
            setUser(null);
            console.warn("No user found for address", address);
          }
        } catch (err) {
          setUser(null);
          console.error("Error fetching user:", err);
        }
      }

      
      fetchUser();

   }, [fid])

   useEffect(() => {

    async function fetchTokenDetail() {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            "0x8a7C645B17cfe1D3B345BcaACdCC65d3e08b7Ccb",
            CreatorFactory.abi,
            signer
          );
          const address = user.verified_addresses.eth_addresses[1]
          const tokenByCreator = await contract.getTokenByCreator(address);
          console.log(tokenByCreator);
          setTokenData(tokenByCreator);
          setTokenAvailable(true)

        } catch (error) {
          console.error("No token found or contract call failed:", error);

        }
      }


    async function fetchUserCasts(){
        const options = {
          method: 'GET',
          headers: {'x-api-key': import.meta.env.VITE_NEYNAR_API_KEY, 'x-neynar-experimental': 'false'}
        };
  
        try {
          const res = await fetch(
            `https://api.neynar.com/v2/farcaster/feed/user/casts/?limit=25&include_replies=true&fid=${fid}`,
            options
          );
          const data = await res.json();
          const userCasts = data["casts"];
          console.log(userCasts)
          if (userCasts) {
            setCasts(userCasts);
          } else {
            console.warn("No casts found");
          }
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      }

      async function fetchTokenPrice(user) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
      
          const factory = new ethers.Contract(
            "0x8a7C645B17cfe1D3B345BcaACdCC65d3e08b7Ccb",
            CreatorFactory.abi,
            signer
          );
          const address = user.verified_addresses.eth_addresses[1]
          const tokenData = await factory.getTokenByCreator(address);
          const tokenAddress = tokenData.tokenAddress;

          const tokenContract = new ethers.Contract(
      tokenAddress,
      CreatorToken.abi,
      signer
    );    
      
          // Step 3: Call totalSupply()
          const rawSupply = await tokenContract.totalSupply();
      
          // Step 4: Calculate price using your utility
        
          const priceOfToken = calculateCreatorTokenPrice({
            growthScore: user.score,
            supply:  Number(rawSupply)
          });
          setTokenPrice(priceOfToken)
          console.log("Price of token:", priceOfToken);
        } catch (error) {
          console.error("Error fetching token price:", error);
        }
      }

      fetchTokenDetail();
      fetchTokenPrice(user);
      fetchUserCasts();

   },[user])

    if (!user) {
         return (
           <div className="mx-30 my-10">
             <div className="flex gap-30">
             <CastCardLoader />
             <CastCardLoader />
             </div>
             <div className="mt-10">
             <CastCardLoader />
             </div>   
           </div>
         );
       }

     const sideLeft = () => {
          let slider = document.getElementById('slider');
          slider.scrollLeft = slider.scrollLeft - 700;
        }
      
        const sideRight = () => {
          let slider = document.getElementById('slider');
          slider.scrollLeft = slider.scrollLeft + 700;
        }

        const handlePurchase = async () => {
          const url = 'https://fast-price-exchange-rates.p.rapidapi.com/api/v1/convert?amount=1&base_currency=USD&quote_currency=ETH';
        
          const options = {
            method: 'GET',
            headers: {
              'x-rapidapi-key': import.meta.env.VITE_RAPID_API_KEY,
              'x-rapidapi-host': 'fast-price-exchange-rates.p.rapidapi.com'
            }
          };
        
          try {
            const response = await fetch(url, options);
            const result = await response.json();
            const ethPerUsd = result.to.ETH;
        
            const ethAmount = (tokenPrice * ethPerUsd).toFixed(6);
        
            const pricePerToken = ethers.parseEther(`${ethAmount}`);
            const expiry = Math.floor(Date.now() / 1000) + 3600;
            const tokenAddress = tokenData.tokenAddress;
        
            const res = await fetch('/api/generate-signature', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tokenAddress,
                userAddress: user.verified_addresses.eth_addresses[1],
                purchaseAmount,
                pricePerToken: pricePerToken.toString(),
                expiry
              })
            });
        
            if (!res.ok) throw new Error("Failed to get signature from backend");
            const { signature } = await res.json();
        
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const token = new ethers.Contract(tokenAddress, CreatorToken.abi, signer);
        
            const amount = Number(purchaseAmount);
            const totalValue = pricePerToken * BigInt(amount);
            const buffer = BigInt(Math.ceil(Number(totalValue) * 1.01));
        
            if (amount > 25) {
              toast.error("You can buy max 25 tokens in one transaction");
              return;
            }
        
            await toast.promise(
              async () => {
                const tx = await token.mintWithSignature(
                  amount,
                  pricePerToken,
                  expiry,
                  signature,
                  { value: buffer }
                );
                const receipt = await tx.wait();
        
                if (receipt.status !== 1) {
                  throw new Error("Transaction failed");
                }
        
                navigate(`/profile`);
              },
              {
                loading: "Purchase in progress...",
                success: "Tokens purchased successfully! 🎉",
                error: (err) => err?.message || "Failed to launch token",
              },
              {
                success: {
                  duration: 4000,
                  style: {
                    background: "#333",
                    color: "#fff",
                    borderRadius: "10px",
                  },
                },
              }
            );
        
          } catch (error) {
            console.error("Error during purchase:", error);
            toast.error(error.message);
          }
        };
        
    
    
     return (
      <div className="w-full max-w-7xl mx-auto px-4 py-6 flex flex-col gap-10">
      {/* Profile Section */}
      <div className="flex flex-col lg:flex-row gap-20 justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-8 lg:flex-row">
      <img
            src={user.pfp_url}
            alt="Profile"
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-md"
          />
        {/* User Info */}
        <div className="flex flex-col items-center lg:items-start gap-6">
          
          <div className="text-center lg:text-left">
            <h1 className="text-xl md:text-2xl font-semibold">{user.display_name}</h1>
            <p className="text-gray-400">@{user.username}</p>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm md:text-base">
              <div><h2 className="font-semibold">Followers</h2><p>{user.follower_count}</p></div>
              <div><h2 className="font-semibold">Following</h2><p>{user.following_count}</p></div>
              <div><h2 className="font-semibold">Score</h2><p>{user.score}</p></div>
            </div>
            <p className="mt-4 italic">{user.profile.bio.text}</p>
          </div>
        </div>
        </div>
        {/* Token Card */}
        <div>
          <TokenCard isUser = {false} available={tokenAvailable} tokenData={tokenData} tokenPrice={tokenPrice} />
          <div className="w-full mt-3 text-center">
          <button
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md w-1/2 self-center cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        Buy Token
      </button>
      </div>
      <Modal isOpen={isModelOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-lg font-bold mb-4">Buy Creator Token</h2>
        <div>
        <p>{tokenData.name}</p>
        <p className="mb-2 text-sm text-white/60">{tokenData.symbol}</p>
        </div>
        <input
        min={1}
        step={1}
          value={purchaseAmount}
          onChange={(e) => setPurchaseAmount(e.target.value)}
          type="number"
          className="w-full border rounded p-2"
          placeholder="Enter token amount"
        />
        <p className="mt-3">Amount in dollars</p>
        <p>${(tokenPrice*purchaseAmount).toFixed(2)}</p>
        <p className="text-sm text-white/60 mt-5 italic">*Final cost may be higher due to Ethereum gas fees, which are not included in the price above.</p>
        <button
        onClick={handlePurchase}
         disabled={purchaseAmount <= 0}
          className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer font-bold py-2 rounded"
        >
          Confirm Purchase
        </button>
      </Modal>
        </div>
      </div>
    
      {/* Cast Section */}
      <div className="bg-[#141414] rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold pl-2 text-white">Casts</h2>
          <div className="flex">
            <div className="bg-[#272727] m-1 rounded-md hover:bg-gray-800">
              <MdChevronLeft onClick={sideLeft} size={30} className="text-gray-200 cursor-pointer" />
            </div>
            <div className="bg-[#272727] m-1 rounded-md hover:bg-gray-800">
              <MdChevronRight onClick={sideRight} size={30} className="text-gray-200 cursor-pointer" />
            </div>
          </div>
        </div>
    
        <div className="relative mt-4">
          <div
            id="slider"
            className="flex gap-4 w-full overflow-x-auto scroll-smooth whitespace-nowrap scrollbar-hide py-2"
          >
            {casts.length > 0 ? (
              casts.map((cast, i) => (
                <div key={i} className="flex-shrink-0 w-[280px] sm:w-[300px] m-5 md:m-0 h-[280px]">
                  <UserCastCard cast={cast} />
                </div>
              ))
            ) : (
              <p className="text-white">No casts to display</p>
            )}
          </div>
        </div>
      </div>
      <div>
        <SocialGraph fid={fid}/>

      </div>
    </div>
    
     )
    }
    