import {formatDistanceStrict} from 'date-fns'

export default function UserCastCard({cast}){

    function convertTimeToNow(timestamp){
        return formatDistanceStrict(new Date(timestamp), new Date())
    }

    return (
        <div className='my-5 pb-2 '>
        <div className="flex mx-5 mt-5 ">
            <div className="mx-5">
            <img
  src={cast.author.pfp_url}
  alt="Profile"
  className="w-14 h-14 rounded-full shadow-md object-cover object-center"
/>


            </div>
            <div>
                <div className='flex gap-3'>
                <p>{cast.author.username}</p>
                <p className='text-gray-600'>{convertTimeToNow(cast.timestamp)}</p>
                </div>
           
            <p>{cast.text}</p>
            
            </div>
            
        </div>
        <div className='flex gap-5 ml-30'>
        <div className='flex justify-center items-center gap-2'>
        <img className="w-5 h-5" src="/comment.png" alt="StakeMe Logo"/>
            {cast.replies.count || 0}
        </div>
        <div className='flex justify-center items-center gap-2'>
        <img className="w-5 h-5" src="/repeating.png" alt="StakeMe Logo"/>
        {cast.reactions.recasts_count || 0}
        </div>
        <div className='flex justify-center items-center gap-2'>
        <img className="w-5 h-5" src="/heart.png" alt="StakeMe Logo"/>
        {cast.reactions.likes_count || 0}
        </div>
        </div>
        
        </div>
    )
}