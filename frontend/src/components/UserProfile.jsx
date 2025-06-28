import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import {MdChevronLeft} from 'react-icons/md';
import {MdChevronRight} from 'react-icons/md';
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
import { useActiveAccount } from "thirdweb/react";
import PurchaseCard from "./PurchaseCard.jsx";
import UserProfileLoader from "./UserProfileLoader.jsx";

export default function UserProfile(){
   const {fid} = useParams();
   const activeAccount = useActiveAccount();
   const navigate = useNavigate();
   const [user, setUser] = useState(null);
  const [tokenPriceInETH, setTokenPriceInETH] = useState(0);
   const [tokenAvailable, setTokenAvailable] = useState()
   const [tokenData, setTokenData] = useState([]);
   const [casts, setCasts] = useState([]);
   const [tokenPrice, setTokenPrice] = useState(0);
  const [isModelOpen, setIsModalOpen] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(0);
  const [userPurchases, setUserPurchases] = useState([]);
  const [userAddress, setUserAddress] = useState("");

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
            setUserAddress(userData.verified_addresses.eth_addresses[1]);
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
          const factoryAddress = import.meta.env.VITE_FACTORY_TOKEN;
          const contract = new ethers.Contract(
           factoryAddress,
            CreatorFactory.abi,
            signer
          );
          const tokenByCreator = await contract.getTokenByCreator(userAddress);
          console.log("tokenByCreator",tokenByCreator);
          setTokenData(tokenByCreator);
          setTokenAvailable(true)

        } catch (error) {
          console.error("No token found or contract call failed:", error);
          setTokenAvailable(false)
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
          const factoryAddress = import.meta.env.VITE_FACTORY_TOKEN;
          const factory = new ethers.Contract(
            factoryAddress,
            CreatorFactory.abi,
            signer
          );
          const tokenData = await factory.getTokenByCreator(userAddress);
          const tokenAddress = tokenData.tokenAddress;

          const tokenContract = new ethers.Contract(
      tokenAddress,
      CreatorToken.abi,
      signer
    );    
      
          // Step 3: Call totalSupply()
          const rawSupply = await tokenContract.totalSupply();
          const tokenSupply = Number(ethers.formatUnits(rawSupply, 18));

          // Step 4: Calculate price using your utility
          console.log("supply",rawSupply )
          console.log("score",user.score)
          const priceOfToken = calculateCreatorTokenPrice({
            growthScore: user.score,
            supply: tokenSupply
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


   useEffect(() => {
    async function fetchPurchases() {
      const factoryAddress =  import.meta.env.VITE_FACTORY_TOKEN;
      const history = await getUserPurchaseHistory(factoryAddress, userAddress);
      console.log("history",history)
      setUserPurchases(history);
    }
  
  fetchPurchases();
  }, [userAddress]);



  async function fetchTokenPurchaseEvents(provider, tokenAddress, userAddress) {
    const token = new ethers.Contract(tokenAddress, CreatorToken.abi, provider);
    console.log("token", token)
    const filter = token.filters.TokenPurchased(userAddress);
    const events = await token.queryFilter(filter, 0, "latest");
    console.log("tokenpurchaseEvents", events)
    // Get metadata
    const name = await token.name();
    const symbol = await token.symbol();
  
    return events.map(e => ({
      tokenAddress,
      name,
      symbol,
      amount: e.args.amount.toString(),
      price: ethers.formatEther(e.args.pricePerToken),
      timestamp: Number(e.args.timestamp),
      txHash: e.transactionHash,
    }));
  }


  async function getUserPurchaseHistory(factoryAddress, userAddress) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const factory = new ethers.Contract(
      factoryAddress,
      CreatorFactory.abi,
      provider
    );
  
    const tokenAddresses = await factory.allTokens();
    let allPurchases = [];
  
    for (const tokenAddr of tokenAddresses) {
      try {
        const tokenPurchases = await fetchTokenPurchaseEvents(provider, tokenAddr, userAddress);
        allPurchases = allPurchases.concat(tokenPurchases);
      } catch (err) {
        console.error(`Failed to fetch for ${tokenAddr}`, err);
      }
    }
  
    return allPurchases.sort((a, b) => b.timestamp - a.timestamp);
  }

    if (!user) {
         return (
   
          <UserProfileLoader />

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
         // const url = 'https://fast-price-exchange-rates.p.rapidapi.com/api/v1/convert?amount=1&base_currency=USD&quote_currency=ETH';

         const url = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json";
        
          // const options = {
          //   method: 'GET',
          //   headers: {
          //     'x-rapidapi-key': import.meta.env.VITE_RAPID_API_KEY,
          //     'x-rapidapi-host': 'fast-price-exchange-rates.p.rapidapi.com'
          //   }
          // };
        
          try {
            const response = await fetch(url);
            const result = await response.json();
            const ethPerUsd = result['usd'].eth;
        
            const ethAmount = (tokenPrice * ethPerUsd).toFixed(6);
        
            const pricePerToken = ethers.parseEther(`${ethAmount}`);
            const expiry = Math.floor(Date.now() / 1000) + 3600;
            const tokenAddress = tokenData.tokenAddress;
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            console.log("Frontend msg.sender will be:", await signer.getAddress());
            const res = await fetch('http://localhost:3000/api/generate-signature', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tokenAddress,
                userAddress: await signer.getAddress(),
                purchaseAmount: Number(purchaseAmount),
                pricePerToken: pricePerToken.toString(),
                expiry
              })
            });
        
            if (!res.ok) throw new Error("Failed to get signature from backend");
            const { signature } = await res.json();
        
           
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
          {tokenAvailable && (
  <button
    onClick={() => setIsModalOpen(true)}
    className="w-1/2 self-center cursor-pointer bg-[#7f2cff] hover:bg-[#6821cc] text-white font-semibold py-2 rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
  >
    Buy Token
  </button>
)}

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
      <div className="flex gap-5">
        <div className="w-2/3">
        <SocialGraph fid={user.fid}/>
        </div>
        <div className="w-1/3 bg-[#141414]  p-4 rounded-2xl overflow-y-auto scroll-smooth">
        <h2 className="text-2xl mx-auto font-semibold my-5 pl-2 text-white">User Purchase History</h2>
        {userPurchases.length > 0 ? (userPurchases.map((purchase) => (
          <PurchaseCard purchase={purchase}/>
    ))) : 
    <p className="text-white bg-black p-5 rounded-2xl">No purchase found</p>
    }
    </div>
      </div>
    </div>
    
     )
    }
    