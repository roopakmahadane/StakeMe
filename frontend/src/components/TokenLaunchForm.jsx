import { useState } from "react";
import launch from "../lotties/launch.json";
import Lottie from "lottie-react";
import StarLayer from "./StarLayer";
import { ethers } from "ethers";
import CreatorFactory from "../../src/constants/CreatorFactory.json";
import { useActiveAccount } from "thirdweb/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function TokenLaunchForm() {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const activeAccount = useActiveAccount();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tokenName || !tokenSymbol) {
      toast.error("Please enter both token name and symbol");
      return;
    }

    if (tokenSymbol.length > 5 || !/^[a-zA-Z]+$/.test(tokenSymbol)) {
      toast.error("Symbol must be max 5 letters (A-Z)");
      return;
    }

    if (!window.ethereum) {
      return alert("Please install MetaMask to continue.");
    }

    setLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const factoryAddress = import.meta.env.VITE_FACTORY_TOKEN;

      const contract = new ethers.Contract(
        factoryAddress,
        CreatorFactory.abi,
        signer
      );

      await toast.promise(
        async () => {
          // Step 1: Call createToken
          const tx = await contract.createToken(tokenName, tokenSymbol);
          const receipt = await tx.wait(5);
          if (receipt.status !== 1) {
            throw new Error("Transaction failed");
          }

          // Step 2: Get token address
          const creatorAddress =
            activeAccount?.address || (await signer.getAddress());
          const tokenData = await contract.getTokenByCreator(creatorAddress);
          const tokenAddress = tokenData.tokenAddress;
          const backendSignerAddress =
            "0xe91429169542837A43C70CacFAFBAA5D7e8e63C7";

          // Step 3: Wait for Etherscan sync
          await new Promise((res) => setTimeout(res, 5000));

          // Step 4: Verification loop
          let attempts = 0;
          let verified = false;

          while (!verified && attempts < 5) {
            try {
              toast.loading(`Verifying on Etherscan (Attempt ${attempts + 1})`, {
                id: "verify-toast",
              });

              const verifyRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  address: tokenAddress,
                  constructorArgs: [
                    creatorAddress,
                    backendSignerAddress,
                    tokenName,
                    tokenSymbol,
                  ],
                }),
              });

              const result = await verifyRes.json();

              if (verifyRes.ok) {
                verified = true;
                toast.success("Contract verified on Etherscan ✅", {
                  id: "verify-toast",
                });

                toast.success(
                  (t) => (
                    <span>
                      Token verified 🎉&nbsp;
                      <a
                        href={`https://sepolia.etherscan.io/address/${tokenAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-200"
                      >
                        View on Etherscan ↗
                      </a>
                    </span>
                  ),
                  { duration: 6000 }
                );
              } else {
                throw new Error(result?.error || "Verification failed");
              }
            } catch (err) {
              attempts++;
              toast.error(
                `Attempt ${attempts} failed. Retrying in 20s...`,
                { id: "verify-toast" }
              );
              await new Promise((res) => setTimeout(res, 20000));
            }
          }

          navigate("/profile");
        },
        {
          loading: "Launching and verifying your token... ⏳",
          success: "Token launched and verified successfully 🎉",
          error: (err) => err?.message || "Failed to launch token",
        },
        {
          success: {
            duration: 4000,
            style: {
              background: "#333",
              color: "#fff",
              borderRadius: "10px",
            },
          },
        }
      );
    } catch (error) {
      console.error("Token launch error:", error);
      toast.error("Something went wrong during deployment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen relative">
      <StarLayer key="constant-key"/>
      <Lottie animationData={launch} loop={true} className="h-40 md:h-60 md:mx-15 sm:block hidden lg:mx-30  lg:h-90 mb-4" />
      <div className="flex flex-col items-center gap-6 p-6 bg-gradient-to-r from-pink-500 to-purple-600 xl:w-2/6 w-full mx-8 sm:w-3/6 rounded-2xl lg:mr-40  bg-opacity-30 backdrop-blur-md">
        <h1 className="text-3xl font-bold">Launch your Token</h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full"
        >
          <div className="flex flex-col p-5">
            <label className="text-2xl font-bold" htmlFor="token-name">
              Name
            </label>
            <input
              value={tokenName}
              placeholder="Token Name"
              onChange={(e) => setTokenName(e.target.value)}
              type="text"
              id="token-name"
              className="bg-white text-black w-full rounded-lg p-2 mt-1"
            />
          </div>
          <div className="flex flex-col p-5">
            <label className="text-2xl font-bold" htmlFor="token-symbol">
              Symbol
            </label>
            <input
              value={tokenSymbol}
              placeholder="Symbol"
              onChange={(e) => setSymbol(e.target.value)}
              type="text"
              id="token-symbol"
              className="bg-white text-black w-full rounded-lg p-2 mt-1"
            />
          </div>
          <div className="flex items-center justify-center">
            <button
              disabled={loading || !activeAccount}
              type="submit"
              className={`cursor-pointer mt-2 bg-gradient-to-r from-purple-400 to-pink-500 text-white px-4 py-2 w-[50%] rounded-full font-semibold ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Launching..." : "Launch!"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
