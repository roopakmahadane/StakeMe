import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function SocialGraph({ fid }) {
  const [bestFriends, setBestFriends] = useState([]);
  const [containerSize, setContainerSize] = useState(600);
  const containerRef = useRef(null);

  // Dynamically update container size
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerSize(entry.contentRect.width);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    async function getBestFriends() {
      const options = {
        method: "GET",
        headers: {
          "x-api-key": import.meta.env.VITE_NEYNAR_API_KEY,
          "x-neynar-experimental": "false",
        },
      };

      try {
        const res = await fetch(
          `https://api.neynar.com/v2/farcaster/user/best_friends/?limit=10&fid=${fid}`,
          options
        );
        const data = await res.json();
        const friendsData = data["users"];

        if (friendsData?.length > 0) {
          const fids = friendsData.map((f) => f.fid).join(",");
          const res2 = await fetch(
            `https://api.neynar.com/v2/farcaster/user/bulk/?fids=${fids}`,
            options
          );
          const detailed = await res2.json();

          const mapped = detailed.users.map((user) => {
            const matching = friendsData.find((f) => f.fid === user.fid);
            return {
              fid: user.fid,
              pfp: user.pfp_url,
              username: matching.username,
              score: matching.mutual_affinity_score,
            };
          });
          setBestFriends(mapped);
        } else {
          setBestFriends([]);
        }
      } catch (err) {
        console.error("Error fetching best friends:", err);
      }
    }

    getBestFriends();
  }, []);

  function normalizeSize(score, maxScore, min = 50, max = 150) {
    if (!maxScore || maxScore === 0) return min;
    return min + (score / maxScore) * (max - min);
  }

  function isOverlapping(x1, y1, size1, x2, y2, size2) {
    return (
      x1 < x2 + size2 &&
      x1 + size1 > x2 &&
      y1 < y2 + size2 &&
      y1 + size1 > y2
    );
  }

  const placeCircles = (friends) => {
    const positions = [];
    const maxScore = Math.max(...friends.map((f) => f.score));

    const bubbles = friends.map((friend) => {
      const size = normalizeSize(friend.score, maxScore, containerSize * 0.08, containerSize * 0.25);
      let x, y;
      let tries = 0;
      let overlapping;
      do {
        x = Math.random() * (containerSize - size);
        y = Math.random() * (containerSize - size);
        overlapping = positions.some((pos) =>
          isOverlapping(x, y, size, pos.x, pos.y, pos.size)
        );
        tries++;
      } while (overlapping && tries < 1000);

      positions.push({ x, y, size });
      return { ...friend, x, y, size };
    });

    return bubbles;
  };

  const bubbles = placeCircles(bestFriends);

  if(bubbles.length<10){
    return (
        <div className="bg-[#141414] rounded-2xl w-2/3 p-4">
             <h2 className="text-2xl mx-auto font-semibold my-5 pl-2 text-white">Social Graph</h2>
             <div className="p-10 bg-black text-2xl max-w-2xl  border border-white/10 rounded-2xl">
             <h2>No friends.... be more social</h2>
             </div>
            
        </div>
    )
  }

  return (
    <div className="bg-[#141414] rounded-2xl w-2/3 p-4 pb-10">
        <h2 className="text-2xl mx-auto font-semibold my-5 pl-2 text-white">Social Graph</h2>
        <div
      ref={containerRef}
      className="relative bg-black hidden md:block aspect-square mx-auto w-full max-w-2xl  border border-white/10 rounded-2xl overflow-hidden"
    >
      {bubbles.map((friend, idx) => (
        <Link key={idx} to={`/account/${friend.fid}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div
            className="absolute hover:scale-105 transition-transform duration-300 rounded-full text-white flex items-center justify-center text-center overflow-hidden border border-white/30 backdrop-blur-md"
            style={{
              width: `${friend.size}px`,
              height: `${friend.size}px`,
              left: `${friend.x}px`,
              top: `${friend.y}px`,
              backgroundImage: `url(${friend.pfp})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <span className="bg-black/70 px-2 py-1 text-md rounded-md">
              {friend.username}
            </span>
          </div>
        </Link>
      ))}
    </div>
    </div>
 
  );
}
