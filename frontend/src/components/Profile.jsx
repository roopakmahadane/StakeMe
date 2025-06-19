import { useEffect, useState } from "react";
import {ethers} from "ethers"
import CreatorFactory from "../../../artifacts/contracts/CreatorFactory.sol/CreatorFactory.json"
import CreatorToken from "../../../artifacts/contracts/CreatorToken.sol/CreatorToken.json" 
import TokenCard from './TokenCard'
import UserCastCard from './UserCastCard.jsx'
import {calculateCreatorTokenPrice} from '../utils/calculateTokenPrice.js'
import { useActiveAccount } from "thirdweb/react";
import CastCardLoader from "./CastCardLoader";
import {MdChevronLeft} from 'react-icons/md';
import {MdChevronRight} from 'react-icons/md';

export default function Profile(){
   
    const activeAccount = useActiveAccount();
    const [user, setUser] = useState(null);

    const [tokenAvailable, setTokenAvailable] = useState(false)
    const [tokenData, setTokenData] = useState([]);
    const [casts, setCasts] = useState([]);
    const [tokenPrice, setTokenPrice] = useState(0);




    useEffect(() => {
    console.log("address", activeAccount?.address)
      async function fetchUser() {
        if (!activeAccount?.address) return;
  
        const address = activeAccount.address.toLowerCase();
  
        const options = {
          method: "GET",
          headers: {
            "x-api-key":import.meta.env.VITE_NEYNAR_API_KEY,
            "x-neynar-experimental": "false",
          },
        };
  
        try {
          const res = await fetch(
            `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`,
            options
          );
          const data = await res.json();
          console.log("Raw API response:", data);
          const userData = data[address][0];
          console.log("userData in profile",userData)
          console.log(userData)
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
    

      async function fetchTokenDetail() {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            "0x8a7C645B17cfe1D3B345BcaACdCC65d3e08b7Ccb",
            CreatorFactory.abi,
            signer
          );
    
          const tokenByCreator = await contract.getTokenByCreator(activeAccount?.address);
          console.log(tokenByCreator);
          setTokenData(tokenByCreator);
          setTokenAvailable(true)

        } catch (error) {
          console.error("No token found or contract call failed:", error);

        }
      }

      fetchUser();
      fetchTokenDetail();
     
      
    },[activeAccount?.address])


    useEffect(() => {
      console.log("second useEffect", user)
      async function fetchUserCasts(){
        const options = {
          method: 'GET',
          headers: {'x-api-key': import.meta.env.VITE_NEYNAR_API_KEY, 'x-neynar-experimental': 'false'}
        };
  
        try {
          const res = await fetch(
            `https://api.neynar.com/v2/farcaster/feed/user/casts/?limit=25&include_replies=true&fid=${user.fid}`,
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
       
          const tokenData = await factory.getTokenByCreator(activeAccount?.address);
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
    <div >
      <TokenCard isUser = {true} available={tokenAvailable} tokenData={tokenData} tokenPrice={tokenPrice} />
    </div>
  </div>

  {/* Cast Section */}
  <div className="bg-[#141414] rounded-2xl p-4">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold pl-2 text-white">Your Casts</h2>
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
</div>

 )
}
