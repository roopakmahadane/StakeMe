import { thirdwebClient } from "../thirdwebclient";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";

const Header = () => {
  const activeAccount = useActiveAccount();
  const [user, setUser] = useState(null);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const wallet = createWallet("io.metamask");

  useEffect(() => {
    async function fetchUser() {
      if (!activeAccount?.address) return;

      const address = activeAccount.address.toLowerCase();

      const res = await fetch(
        `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`,
        {
          headers: {
            "x-api-key": import.meta.env.VITE_NEYNAR_API_KEY,
            "x-neynar-experimental": "false",
          },
        }
      );

      const data = await res.json();
      const userData = data[address]?.[0];
      setUser(userData || null);
    }

    fetchUser();
  }, [activeAccount?.address]);

  const handleProfileClick = () => {
    if (activeAccount?.address) navigate("/profile");
    else alert("Connect your wallet first");
  };

  const truncateAddress = (addr) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="w-full px-2 py-2 md:px-6 md:py-4 flex justify-between items-center bg-black shadow-lg">
      {/* Left: Logo */}
      <Link to="/" className="flex items-center space-x-2">
        <img className="w-10 h-10" src="/logo.png" alt="StakeMe Logo" />
        <div className="hidden md:block">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
            StakeMe
          </h1>
          <p className="text-xs text-purple-300">v1.0</p>
        </div>
      </Link>

      {/* Center: Search */}
      <div className=" sm:w-lg w-28">
        <SearchBar />
      </div>

      {/* Right: Profile / Connect */}
      <div className="flex items-center gap-4 scale-[0.50] sm:scale-100 origin-right max-w-[200px] overflow-hidden">
        {activeAccount ? (
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-3 px-3 py-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] rounded-full text-white transition"
          >
            <div
              className="w-9 h-9 cursor-pointer rounded-full bg-cover bg-center"
              style={{
                backgroundImage: user?.pfp_url && !imageError
                  ? `url(${user.pfp_url})`
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              {!user?.pfp_url || imageError ? (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">
                  {user?.display_name?.[0]?.toUpperCase() || "?"}
                </div>
              ) : null}
              <img
                src={user?.pfp_url}
                alt="pfp"
                className="hidden"
                onError={() => setImageError(true)}
              />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">
                @{user?.username || truncateAddress(activeAccount.address)}
              </p>
              <p className="text-xs text-gray-400">
                {truncateAddress(activeAccount.address)}
              </p>
            </div>
          </button>
        ) : (
          <div className="">
          <ConnectButton client={thirdwebClient} wallets={[wallet]} />
        </div>

        )}
      </div>
    </div>
  );
};

export default Header;
