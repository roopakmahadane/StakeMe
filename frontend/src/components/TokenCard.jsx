import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function TokenDefault({ available, tokenData, tokenPrice, isUser }) {
  useEffect(() => {
    console.log("inside token card", available, tokenData);
  }, []);

  return (
    <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-4 shadow-inner text-white w-full">
      {available ? (
        <div className="space-y-4">
          <div className="text-center text-xl font-semibold text-white/90">
            Creator Token Info
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#2a2a2a] p-4 rounded-xl shadow-md">
              <p className="text-sm text-white/60">Token Name</p>
              <p className="text-xl font-bold">{tokenData.name}</p>
            </div>

            <div className="bg-[#2a2a2a] p-4 rounded-xl shadow-md">
              <p className="text-sm text-white/60">Token Symbol</p>
              <p className="text-xl font-bold">{tokenData.symbol}</p>
            </div>

            <div className="col-span-2 bg-[#111] p-4 rounded-xl shadow-md flex justify-between items-center">
              <p className="text-sm text-white/60">Price</p>
              <p className="text-2xl font-bold text-white">
                {tokenPrice ? `$${tokenPrice.toFixed(2)}` : "N/A"}
                <span className="ml-1 text-sm font-medium text-white/40">/token</span>
              </p>
            </div>
          </div>
        </div>
      ) : isUser ? (
        <Link
          to="/createToken"
          role="button"
          aria-label="Launch your own token"
          className="flex justify-center items-center p-4  bg-[#2a2a2a] text-white font-bold rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
        >
          🚀 Launch Your Token
        </Link>
      ) : (
        <div className="text-center">
          <p className="text-white/70 text-sm">Creator hasn’t launched a token yet.</p>
          <p className="text-white/40 text-xs mt-1">Follow them to stay updated!</p>
        </div>
      )}
    </div>
  );
}
