
import { useEffect, useState } from "react";
import {MdChevronLeft} from 'react-icons/md';
import {MdChevronRight} from 'react-icons/md';
import CastCard from "./CastCard";

export default function TrendingCast(){
    const [topCasts, setTopCasts] = useState([]);

    useEffect(() => {

        async function getTrendingCasts(){

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
    
              }
              catch(err){
                console.log(err);
              }

        }
       
        getTrendingCasts();

    },[])

    const sideLeft = () => {
        let slider = document.getElementById('slider');
        slider.scrollLeft = slider.scrollLeft - 700;
      }
    
      const sideRight = () => {
        let slider = document.getElementById('slider');
        slider.scrollLeft = slider.scrollLeft + 700;
      }


    return(
<div className="p-4 pb-8 mt-10 bg-[#141414] mx-20 w-2/5 rounded-2xl h-auto">
  <div className="flex items-center justify-between">
    <h2 className="text-2xl ml-4 font-semibold text-gray-200">Trending Feeds</h2>
    {/* Optional: remove left/right scroll buttons if not needed */}
  </div>

  <div className="relative mt-4">
    <div
      className="flex flex-col space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 pr-2"
    >
      {topCasts.map((topCast, i) => (
        <div key={i} className="h-auto">
          <CastCard cast={topCast} />
        </div>
      ))}
    </div>
  </div>
</div>


        
    )
}
