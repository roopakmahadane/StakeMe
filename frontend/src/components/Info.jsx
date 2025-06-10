import Lottie from "lottie-react";
import connectAnim from "../lotties/connect.json";
import mintAnim from "../lotties/mint.json";
import shareAnim from "../lotties/share.json";

export default function HowItWorksSection() {
  return (
    <div className="bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-[#1a1a1a] text-white py-16 px-6 md:px-16 rounded-3xl mx-4 md:mx-10 mt-12 shadow-2xl border border-[#2a2a2a]">
      <h2 className="text-4xl font-extrabold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text tracking-wide animate-pulse">
        So... What’s This?
      </h2>
      <p className="text-center text-lg max-w-2xl mx-auto text-gray-300 font-medium mb-12">
        🚀 Turn your Farcaster profile into a launchpad. Mint your token, grow your tribe, and earn as you vibe.  
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {/* Step 1 */}
        <div className="bg-[#1f1f1f] hover:bg-[#292929] transition-all duration-300 p-6 rounded-2xl border border-[#333] shadow-md hover:scale-105">
          <Lottie animationData={connectAnim} loop={true} className="h-36 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-pink-400 mb-2">Connect Farcaster</h3>
          <p className="text-sm text-gray-400">
            Log in with your Farcaster handle and link your wallet. No signup forms, just vibes.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-[#1f1f1f] hover:bg-[#292929] transition-all duration-300 p-6 rounded-2xl border border-[#333] shadow-md hover:scale-105">
          <Lottie animationData={mintAnim} loop={true} className="h-36 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-purple-400 mb-2">Launch Your Token</h3>
          <p className="text-sm text-gray-400">
            One-click mint your own creator token — fully onchain, 100% yours.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-[#1f1f1f] hover:bg-[#292929] transition-all duration-300 p-6 rounded-2xl border border-[#333] shadow-md hover:scale-105">
          <Lottie animationData={shareAnim} loop={true} className="h-36 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-blue-400 mb-2">Share & Earn</h3>
          <p className="text-sm text-gray-400">
            Post it. Share it. Let your fans invest in your future — and get rewarded.
          </p>
        </div>
      </div>
    </div>
  );
}
