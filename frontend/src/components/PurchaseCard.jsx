import { useEffect, useState } from "react"


export default function PurchaseCard({purchase}){
    const [ethToUsd, setEthToUsd] = useState(0);
    useEffect(()=> {

        async function convertETHToUSD(){
              
            const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eth.min.json`;
    
	

try {
	const response = await fetch(url);
	const result = await response.json();
    setEthToUsd(result['eth'].usd);
} catch (error) {
  if(import.meta.env.DEV) {
    console.error("Error fetching ETH to USD conversion rate:", error);
  }
}
        }
        convertETHToUSD();

    },[])

    return(
        <div key={purchase.txHash} className="bg-gray-800 p-4 w-full my-5  rounded-2xl shadow text-white">
        <p className="text-lg font-semibold">{(purchase.amount)} {purchase.symbol}</p>
        <p className="text-sm">at ${(purchase.price*ethToUsd).toFixed(2)} each</p>
        <p className="text-sm text-gray-400">{new Date(purchase.timestamp * 1000).toLocaleString()}</p>
        <a href={`https://sepolia.etherscan.io/tx/${purchase.txHash}`} target="_blank" className="text-blue-400 underline text-sm">
          View on Etherscan
        </a>
      </div>
    )
}