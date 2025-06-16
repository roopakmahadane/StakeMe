import { useEffect, useState } from "react";
import {ethers} from "ethers"
import CreatorFactory from "../../../artifacts/contracts/CreatorFactory.sol/CreatorFactory.json"
import CreatorToken from "../../../artifacts/contracts/CreatorToken.sol/CreatorToken.json" 
import TokenCard from './TokenCard'
import UserCastCard from './UserCastCard.jsx'
import {calculateCreatorTokenPrice} from '../utils/calculateTokenPrice.js'
import { useActiveAccount } from "thirdweb/react";
import CastCardLoader from "./CastCardLoader";

export default function Profile(){
   
    const activeAccount = useActiveAccount();
    const [user, setUser] = useState(null);

    const [tokenAvailable, setTokenAvailable] = useState(false)
    const [tokenData, setTokenData] = useState([]);
    const [casts, setCasts] = useState([]);
    const [tokenPrice, setTokenPrice] = useState(0);

    useEffect(() => {
      console.log("activeAccount in Profile:", activeAccount?.address);
    }, [activeAccount?.address]);


    useEffect(() => {
    console.log("address", activeAccount?.address)
      async function fetchUser() {
        if (!activeAccount?.address) return;
  
        const address = activeAccount.address.toLowerCase();
  
        const options = {
          method: "GET",
          headers: {
            "x-api-key": "242C0032-6A56-43BF-911A-A02EBBEF2B52",
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
          headers: {'x-api-key': "242C0032-6A56-43BF-911A-A02EBBEF2B52", 'x-neynar-experimental': 'false'}
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


 return (
  <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto px-4 py-6 gap-8">
  {/* Left section: Profile and Casts */}
  <div className="flex-1">
    {/* Profile Section */}
    <div className="flex flex-col md:flex-row items-center gap-6">
      <img
        src={user.pfp_url}
        alt="Profile"
        className="w-32 h-32 rounded-full shadow-md object-cover object-center"
      />
      <div className="text-center md:text-left">
        <h1 className="text-2xl font-semibold">{user.display_name}</h1>
        <p className="text-gray-500">@{user.username}</p>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="rounded-lg shadow-sm px-3">
            <h2 className="font-semibold">Followers</h2>
            <p>{user.follower_count}</p>
          </div>
          <div className="rounded-lg shadow-sm px-3">
            <h2 className="font-semibold">Following</h2>
            <p>{user.following_count}</p>
          </div>
          <div className="rounded-lg shadow-sm px-3">
            <h2 className="font-semibold">Score</h2>
            <p>{user.score}</p>
          </div>
        </div>
        <p className="mt-4 italic">{user.profile.bio.text}</p>
      </div>
    </div>

    {/* Casts Section */}
    <div className="mt-10">
      <h2 className="text-2xl font-extrabold mb-4">Your casts</h2>
      {casts.length > 0 ? (
        casts.map((cast, i) => (
          <div key={i} className="h-auto">
            <UserCastCard cast={cast} />
          </div>
        ))
      ) : (
        <p>No casts to display</p>
      )}
    </div>
  </div>

  {/* Right section: Token Card */}
  <div className="w-full md:w-1/3">
    <TokenCard available={tokenAvailable} tokenData={tokenData} tokenPrice={tokenPrice}/>
  </div>
</div>

 )
}
