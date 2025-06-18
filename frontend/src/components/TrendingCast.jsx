
import { useEffect, useState } from "react";
import CastCard from "./CastCard";
import CastCardLoader from "./CastCardLoader";
import {MdChevronLeft} from 'react-icons/md';
import {MdChevronRight} from 'react-icons/md';

export default function TrendingCast(){
    const [topCasts, setTopCasts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        async function getTrendingCasts(){
            setLoading(true)
            const options = {
                method: "GET",
                headers: {
                  "x-api-key": "242C0032-6A56-43BF-911A-A02EBBEF2B52",
                  "x-neynar-experimental": "false",
                },
              };
    
              try{
                const res = await fetch('https://api.neynar.com/v2/farcaster/feed/trending/?limit=10&time_window=24h&provider=neynar', options);
                const data = await res.json();
                console.log(data["casts"]);
                setTopCasts(data["casts"]);
                setLoading(false);
              }
              catch(err){
                console.log(err);
              }

        }
       
        getTrendingCasts();

    },[])



    return(
<div className="p-4 pb-8 mt-10 bg-gradient-to-br from-[#141414] via-[#0f0f0f] to-[#1a1a1a] mx-5 w-2/5 rounded-2xl h-auto border border-[#2a2a2a]">
  <div className="flex items-center justify-between">
    <h2 className="text-2xl ml-4 font-semibold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text tracking-wide">Trending Feeds</h2>
    {/* Optional: remove left/right scroll buttons if not needed */}
  </div>

  <div className="relative mt-4">
    {loading? 
    <>
     <CastCardLoader />
     <CastCardLoader />
     <CastCardLoader />
     <CastCardLoader />
    </>
   :

    <div
    className="flex flex-col space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 pr-2 scrollbar-hidden"
  >
    {topCasts.map((topCast, i) => (
      <div key={i} className="h-auto">
        <CastCard cast={topCast} />
      </div>
    ))}
  </div>
}
  
  </div>
</div>


        
    )
}
