import dotenv from "dotenv";

dotenv.config();

import {NeynarAPIClient, Configuration} from "@neynar/nodejs-sdk";


const config = new Configuration({
    apiKey: process.env.NEYNAR_API_KEY,
  });

  const client = new NeynarAPIClient(config);

// const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY);

const address = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045"; // Vitalik.eth

async function fetchUserByAddress() {
  try {
    const options = {
        method: 'GET',
        headers: {
          'x-api-key': '242C0032-6A56-43BF-911A-A02EBBEF2B52',
          'x-neynar-experimental': 'false'
        }
      };
      
      fetch('https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=0xd8da6bf26964af9d7eed9e03e53415d37aa96045', options)
        .then(response => response.json())
        .then(response => console.log(response["0xd8da6bf26964af9d7eed9e03e53415d37aa96045"][0]))
        .catch(err => console.error(err));
  } catch (err) {
    console.error("Error fetching user:", err.message);
  }
}

fetchUserByAddress();

