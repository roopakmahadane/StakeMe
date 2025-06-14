import { calculateCreatorTokenPrice } from "../utils/calculateTokenPrice"
import { useState } from "react"
import launch from '../lotties/launch.json'
import Lottie from "lottie-react";


export default function Form(){
const [tokenName, setTokenName] = useState("");
const [tokenSymbol, setSymbol] = useState("");

    return(
        <div className="flex items-center justify-center mt-20 ">
            <Lottie animationData={launch} loop={true} className="h-90 mx-30 mb-4" />
       <div className="flex flex-col items-center gap-6 p-6 bg-gradient-to-r from-pink-500 to-purple-600 w-2/6 rounded-2xl mr-40 bg-opacity-30 backdrop-blur-md">
        <h1 className="text-3xl">Create your Token</h1>
        <form className="flex flex-col gap-4 w-full max-w-md ">
            <div className="flex flex-col p-5">
                <label className="text-2xl" for ="token-name">Name</label>
                <input value={tokenName} placeholder="Token Name" onChange={e => setTokenName(e.target.value)} type="text" id="token-name" className="bg-white text-black w-full rounded-lg p-2 mt-1"/>
            </div>
            <div className="flex flex-col p-5">
                <label className="text-2xl" for ="token-symbol">Symbol</label>
                <input value={tokenSymbol}  placeholder="Symbol" onChange={e => setSymbol(e.target.value)} type="text" id="token-symbol" className="bg-white text-black w-full rounded-lg p-2 mt-1"/>
            </div>
            <div className="flex items-center justify-center">
            <button type="submit" className=" cursor-pointer mt-2 bg-gradient-to-r from-purple-400 to-pink-500 text-white px-4 py-2 w-[50%] rounded-full font-semibold">Launch!</button>
            </div>
        </form>

       </div>
       </div>
    )
}