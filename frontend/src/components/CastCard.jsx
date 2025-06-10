export default function CastCard({cast}){
    if (!cast) return null;

    const {
      author,
      username,
      display_name,
      pfp_url,
      text,
      reactions,
      replies,
      timestamp,
    } = {
      ...cast,
      ...cast.author,
      username: cast.author.username,
      display_name: cast.author.display_name,
      pfp_url: cast.author.pfp_url,
      reactions: cast.reactions || {},
      replies: cast.replies || {},
    };
  
    const date = new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  
    return (
      <div className=" mx-6 my-2 max-w-md  p-4 rounded-2xl shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <img
            src={pfp_url}
            alt={username}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="ml-3">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {display_name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">@{username}</div>
          </div>
        </div>
  
        <p className="text-gray-800 dark:text-gray-200 mb-3">{text}</p>
  
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <div>❤️ {reactions.likes_count || 0}</div>
          <div>♻️ {reactions.recasts_count || 0}</div>
          <div>💬 {replies.count || 0}</div>
          <div>{date}</div>
        </div>
      </div>
    );
}