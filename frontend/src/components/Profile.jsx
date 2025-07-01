import { useEffect, useState } from "react";
import {ethers} from "ethers"
import CreatorFactory from "../../../artifacts/contracts/CreatorFactory.sol/CreatorFactory.json"
import CreatorToken from "../../../artifacts/contracts/CreatorToken.sol/CreatorToken.json" 
import TokenCard from './TokenCard'
import UserCastCard from './UserCastCard.jsx'
import {calculateCreatorTokenPrice} from '../utils/calculateTokenPrice.js'
import { useActiveAccount } from "thirdweb/react";
import { Link } from "react-router-dom";
import {MdChevronLeft} from 'react-icons/md';
import {MdChevronRight} from 'react-icons/md';
import SocialGraph from './SocialGraph';
import PurchaseCard from "./PurchaseCard.jsx";
import UserProfileLoader from "./UserProfileLoader.jsx";


export default function Profile(){
   
    const activeAccount = useActiveAccount();
    const [user, setUser] = useState(null);

    const [tokenAvailable, setTokenAvailable] = useState()
    const [tokenData, setTokenData] = useState([]);
    const [casts, setCasts] = useState([]);
    const [tokenPrice, setTokenPrice] = useState(0);
    const [userPurchases, setUserPurchases] = useState([]);
    const [userAddress, setUserAddress] = useState("");
    const [loading, setLoading] = useState();
    const [profileAvailable, setProfileAvailable] = useState(false);



    useEffect(() => {
      async function fetchUser() {
        if (!activeAccount?.address) return;
        setLoading(true);
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
          const userData = data[address][0];
          if (userData) {
            setUser(userData);
            setUserAddress(userData.verified_addresses.eth_addresses[1]);
            setLoading(false);
            setProfileAvailable(true);
          } else {
            setUser(null);
            setLoading(false);
            console.warn("No user found for address", address);
          }
        } catch (err) {
          setUser(null);
          setLoading(false);
          console.error("Error fetching user:", err);
        }
      }
    

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
    
          const tokenByCreator = await contract.getTokenByCreator(activeAccount?.address);
         
          setTokenData(tokenByCreator);
          setTokenAvailable(true)

        } catch (error) {
          console.error("No token found or contract call failed:", error);
          setTokenAvailable(false)
        }
      }

      fetchUser();
      fetchTokenDetail();
     
      
    },[activeAccount?.address])


    useEffect(() => {
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
        } catch (error) {
          console.error("Error fetching token price:", error);
        }
      }




      fetchTokenPrice(user);
      fetchUserCasts();


    },[user])

    useEffect(() => {
      console.log("fetchPurchases");
      async function fetchPurchases() {
        const factoryAddress =  import.meta.env.VITE_FACTORY_TOKEN;;
        const history = await getUserPurchaseHistory(factoryAddress, activeAccount?.address);
        console.log("history",history)
        setUserPurchases(history);
      }
    
    fetchPurchases();
    }, [activeAccount?.address]);



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
    



    if (loading) {
      return (
       <UserProfileLoader />
      );
    }
    if(!profileAvailable && !loading){
      return (
        <div className="p-5 w-fit md:mx-auto  mt-40 mx-5 rounded-2xl bg-[#1e1e1e] flex flex-col justify-center items-center  ">
        <h1>No proflie found! Please veirfy your wallet address to view your profile</h1>
        <Link target="_blank"  className="bg-black p-2 mt-5 transition hover:scale-105  hover:text-blue-400  rounded-2xl px-4 " to={'https://farcaster.xyz/~/settings/verified-addresses'}>Verify!</Link>
        </div>
      )
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
  <div className="flex flex-col lg:flex-row  gap-5">
        <div className="w-full hidden lg:block lg:w-2/3">
        <SocialGraph fid={user.fid}/>
        </div>
        <div className="w-full lg:w-1/3 bg-[#141414] max-h-120 overflow-y-auto scroll-smooth p-4 rounded-2xl">
        <h2 className="text-2xl mx-auto font-semibold my-5 pl-2 text-white">Your Purchase History</h2>
        {userPurchases.length> 0 ? (userPurchases.map((purchase) => (
          <PurchaseCard purchase={purchase}/>
    ))) : 
    <p className="text-white bg-black p-5 rounded-2xl">No purchase found</p>
    }
    </div>
      </div>
</div>

 )
}
