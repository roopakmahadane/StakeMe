import { formatDistanceStrict } from 'date-fns';

export default function UserCastCard({ cast }) {
  function convertTimeToNow(timestamp) {
    return formatDistanceStrict(new Date(timestamp), new Date());
  }

  return (
    <div className="w-full min-w-[300px] max-w-[300px] rounded-2xl bg-black p-4 text-white shadow-md flex flex-col justify-between break-words">
      {/* Header */}
      <div className="flex gap-3 items-center mb-3">
        <img
          src={cast.author.pfp_url}
          alt="Profile"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <p className="text-sm font-semibold">{cast.author.username}</p>
          <p className="text-xs text-gray-400">{convertTimeToNow(cast.timestamp)} ago</p>
        </div>
      </div>

      {/* Text Content */}
      <p className="text-sm text-gray-200 mb-4 break-words whitespace-pre-line overflow-hidden">{cast.text}</p>

      {/* Footer Reactions */}
      <div className="flex justify-between text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <img className="w-4 h-4" src="/comment.png" alt="Comments" />
          {cast.replies?.count || 0}
        </div>
        <div className="flex items-center gap-1">
          <img className="w-4 h-4" src="/repeating.png" alt="Recasts" />
          {cast.reactions?.recasts_count || 0}
        </div>
        <div className="flex items-center gap-1">
          <img className="w-4 h-4" src="/heart.png" alt="Likes" />
          {cast.reactions?.likes_count || 0}
        </div>
      </div>
    </div>
  );
}
