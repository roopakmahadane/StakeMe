import { thirdwebClient } from "../thirdwebclient";
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { useActiveAccount } from "thirdweb/react";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";


const Header = () => {
  const activeAccount = useActiveAccount();
  const [user, setUser] = useState(null);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
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
        
        const userData = data[address][0];
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

    fetchUser();
  }, [activeAccount?.address]);

  const handleProfileClick = () => {
    if (activeAccount?.address) {
      navigate("/profile");
    } else {
      alert("Connect your wallet first");
    }
  };

  const wallet = createWallet("io.metamask");

  return (
    <div className="flex justify-between mx-5 items-center py-4">
      <div className="flex items-center space-x-3">
        <img className="w-16 h-16" src="/logo.png" alt="StakeMe Logo" />
        <div>
          <Link to={"/"}>
          <h2 className="bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text tracking-wide font-bold text-xl">StakeMe</h2>
          <h2 className="bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text tracking-wide text-sm">v1.0</h2>
          </Link>
        </div>
      </div>

      <div className="flex items-center">
      <div>
        {user ? (
          <button
            onClick={handleProfileClick}
            className="w-12 h-12 rounded-[40%] overflow-hidden border-2 border-white shadow-lg flex items-center justify-center text-white text-lg font-bold cursor-pointer "
            style={{
              background: user.pfp_url && !imageError
                ? `url(${user.pfp_url}) center/cover no-repeat`
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            {!user.pfp_url || imageError
              ? user.display_name?.charAt(0).toUpperCase() || "?"
              : null}
            <img
              src={user.pfp_url}
              alt="pfp"
              className="hidden"
              onError={() => setImageError(true)}
            />
          </button>
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-600 animate-pulse" />
        )}
      </div>

      <div className="m-5">
        <ConnectButton client={thirdwebClient} wallets={[wallet]} />
      </div>

      </div>
    </div>
  );
};

export default Header;
