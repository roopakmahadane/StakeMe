import debounce from 'lodash.debounce';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function SearchBar(){
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
   
    const searchUsers = debounce(async (value) => {
        if (!value) return setSuggestions([])
            setLoading(true)
    try{
        const options = {
            method: 'GET',
            headers: {'x-api-key': import.meta.env.VITE_NEYNAR_API_KEY, 'x-neynar-experimental': 'false'}
          };

          const response = await fetch(`https://api.neynar.com/v2/farcaster/user/search/?limit=5&q=${query}`, options)
          const data = await response.json();
          setSuggestions(data.result.users || []);
          setLoading(false)
        console.log("query data in search bar", data.result.users.username);

    }catch(err){
        console.log(err);
    } finally {
        setLoading(false)
    }
   }, 500)

    useEffect(() => {
        searchUsers(query)
        return () =>  searchUsers.cancel()

    }, [query])

    

    return(
        <div>
            <input 
            value={query}
            onChange={(e => setQuery(e.target.value))}
            className='bg-[#1a1a1a] p-2 rounded-md min-w-sm border border-[#2a2a2a] '
            placeholder='Search Farcaster users...'
            />
            {suggestions.length>0 && 
            <ul className='absolute z-10 bg-[#1a1a1a] w-sm border border-gray-700 rounded-b-lg  pl-2'>
                {suggestions.map((user) => (
                    <li 
                    onClick={() => {
                        navigate(`./account/${user.fid}`)
                        setSuggestions([]);
                        
                        }} 
                    className='flex gap-3 items-center cursor-pointer hover:bg-gray-800' 
                    key={user.fid} >
                    <img src={user.pfp_url}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                    <p className="font-medium text-white">{user.display_name}</p>
                    <p className="text-sm text-gray-400">@{user.username}</p>
                    </div>
                    
                    </li>
                    
                ))}
            </ul>
            }
        </div>
    )
}