export default function CastCardLoader(){
    return (
     
              <div className="w-full rounded-2xl bg-[#1b1b1b] p-4 mb-4 animate-pulse">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gray-700" />
                  <div className="flex flex-col gap-1">
                    <div className="w-32 h-3 bg-gray-700 rounded" />
                    <div className="w-20 h-2 bg-gray-700 rounded" />
                  </div>
                </div>
                <div className="h-4 bg-gray-700 rounded mb-2" />
                <div className="h-3 bg-gray-700 rounded w-4/5 mb-1" />
                <div className="h-3 bg-gray-700 rounded w-3/5 mb-4" />
          
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex gap-4">
                    <div className="w-4 h-4 bg-gray-700 rounded" />
                    <div className="w-4 h-4 bg-gray-700 rounded" />
                    <div className="w-4 h-4 bg-gray-700 rounded" />
                  </div>
                  <div className="w-20 h-3 bg-gray-700 rounded" />
                </div>
              </div>
            );
}