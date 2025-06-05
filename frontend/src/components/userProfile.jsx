import { useActiveAccount, useWalletBalance } from "thirdweb/react";
 
export default function userProfile() {
  const account = useActiveAccount();
  const { data: balance, isLoading } = useWalletBalance({
    client,
    chain,
    address: account.address,
  });
 
  return (
    <div>
      <p>Wallet address: {account.address}</p>
      <p>
        Wallet balance: {balance?.displayValue} {balance?.symbol}
      </p>
    </div>
  );
}