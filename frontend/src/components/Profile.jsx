
import { useParams, useLocation } from "react-router-dom";

export default function Profile(){
    const { address } = useParams();
    const { state: user } = useLocation();
 return (
    <div className="max-w-4xl mx-auto px-4 py-8">
    <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
            <img
              src={user.pfp_url}
              alt="Profile"
              className="w-32 h-32 rounded-full shadow-md"
            />
            <div className="ml-5">
              <h1 className="text-3xl font-bold">{user.display_name}</h1>
              <p className="text-gray-500">@{user.username}</p>
              <p className="mt-2 text-gray-700 italic">{user.profile.bio.text}</p>
              <div className="flex">
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold">Followers</h2>
          <p>{user.follower_count}</p>
        </div>
        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold">Following</h2>
          <p>{user.following_count}</p>
        </div>
      </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 border rounded shadow-sm">
        <h2 className="text-lg font-semibold">Verified ETH Addresses</h2>
        <ul className="list-disc pl-6">
          {user.verified_addresses.eth_addresses.map((addr, i) => (
            <li key={i} className="break-all">{addr}</li>
          ))}
        </ul>
      </div>
                </div>
 )
}