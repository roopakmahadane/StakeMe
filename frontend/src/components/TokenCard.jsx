import { Link } from "react-router-dom";

export default function TokenDefault({ available, tokenData, tokenPrice }) {
  return (
    <div className="bg-gradient-to-br from-purple-700 via-pink-600 to-yellow-400 rounded-2xl p-4 shadow-xl text-white w-full">
      {available ? (
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-extrabold tracking-wide">Your Token</h2>

          <div className="grid grid-cols-2 gap-2 text-left text-lg font-semibold text-white/90">
            <div className="bg-white/10 p-4 rounded-xl shadow-inner">
              <p className="text-sm text-white/60">Token Name</p>
              <p className="text-xl font-bold">{tokenData.name}</p>
            </div>

            <div className="bg-white/10 p-4 rounded-xl shadow-inner">
              <p className="text-sm text-white/60">Token Symbol</p>
              <p className="text-xl font-bold">{tokenData.symbol}</p>
            </div>

            <div className="col-span-2 bg-white text-black rounded-xl p-2 shadow-md flex justify-between items-center">
              <p className="text-lg font-semibold">Price</p>
              <p className="text-2xl font-bold">${tokenPrice} <span className="text-sm font-medium text-gray-700">/token</span></p>
            </div>
          </div>
        </div>
      ) : (
        <Link
          to="/createToken"
          className="flex justify-center items-center p-4 mt-4 bg-gradient-to-r from-green-400 to-green-600 text-black font-bold rounded-full animate-pulse shadow-md hover:scale-105 transition-transform duration-300"
        >
          🚀 Launch Your Token
        </Link>
      )}
    </div>
  );
}
