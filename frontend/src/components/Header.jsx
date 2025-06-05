
import { client } from "../client";
import { ConnectButton } from "thirdweb/react";
import { createWallet, injectedProvider } from "thirdweb/wallets";

const Header = () =>  {

    // const wallet = inAppWallet({
    //     auth: {
    //       mode: "popup", // options are "popup" | "redirect" | "window";
    //       options: ["farcaster"], // ex: ["discord", "farcaster", "apple", "facebook", "google", "passkey"],
    //       passkeyDomain:"passkey", // for passkey, the domain that the passkey is created on
    //       redirectUrl: "/", // the URL to redirect to after authentication
    //     },
    //   });


      const wallet = createWallet("io.metamask"); // pass the wallet id


    return (
        <div className="flex justify-between mx-5 ">
            <div className="flex items-center">
            <img className="w-20 h-20" src="../../public/logo.png" />
            <div>
            <h2 className="text-white">StakeMe</h2>
            <h2 className="text-white">v1.0</h2>
            </div>
            </div>
            <div className="m-5">
                <ConnectButton client={client} wallets={[wallet]}/>
            </div>
          
        </div>
    )
}

export default Header;