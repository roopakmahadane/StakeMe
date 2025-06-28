import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function UserProfileLoader() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 flex flex-col gap-10">
      {/* Profile Section */}
      <div className="flex flex-col lg:flex-row gap-20 justify-center items-center">
        {/* Profile Image + Info */}
        <div className="flex flex-col justify-center items-center gap-8 lg:flex-row">
          <Skeleton circle height={160} width={160} />
          <div className="flex flex-col items-center lg:items-start gap-4">
            <Skeleton width={200} height={24} />
            <Skeleton width={120} height={18} />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton width={80} height={20} />
              <Skeleton width={80} height={20} />
              <Skeleton width={80} height={20} />
            </div>
            <Skeleton width={300} height={16} count={2} />
          </div>
        </div>

        {/* Token Card */}
        <div className="flex flex-col gap-4 items-center">
          <Skeleton width={200} height={80} />
          <Skeleton width={120} height={40} />
        </div>
      </div>

      {/* Casts */}
      <div className="bg-[#141414] rounded-2xl p-4">
        <Skeleton width={100} height={24} className="mb-4" />
        <div className="flex gap-4 overflow-x-auto">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="w-[300px] h-[280px]">
                <Skeleton height={280} />
              </div>
            ))}
        </div>
      </div>

      {/* Social Graph + Purchase History */}
      <div className="flex gap-5">
        <div className="w-2/3 bg-[#141414] p-4 rounded-2xl">
          <Skeleton width={150} height={24} className="mb-4" />
          <Skeleton height={200} />
        </div>
        <div className="w-1/3 bg-[#141414] p-4 rounded-2xl">
          <Skeleton width={150} height={24} className="mb-4" />
          {Array(2)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="mb-4">
                <Skeleton height={60} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
