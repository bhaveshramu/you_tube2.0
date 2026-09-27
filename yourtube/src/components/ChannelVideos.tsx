import VideoCard from "./videocard";

export default function ChannelVideos({
  videos,
  showDelete = false,
  onDelete,
}: {
  videos: any[];
  showDelete?: boolean;
  onDelete?: (videoId: string) => void;
}) {
  if (videos.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          No videos uploaded yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        Videos
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video: any) => (
          <VideoCard
            key={video._id}
            video={video}
            showDelete={showDelete}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}