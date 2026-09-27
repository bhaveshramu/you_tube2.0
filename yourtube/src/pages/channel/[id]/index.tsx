import ChannelHeader from "@/components/ChannelHeader";
import Channeltabs from "@/components/Channeltabs";
import ChannelVideos from "@/components/ChannelVideos";
import VideoUploader from "@/components/VideoUploader";
import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";

const index = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();

  const [downloads, setDownloads] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  // Check whether this is the logged-in user's own channel
  const isOwnChannel =
    !!user?._id &&
    !!id &&
    String(user._id) === String(id);

  // Fetch uploaded videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axiosInstance.get("/video/getall");

        // Only videos uploaded by this channel
        const channelVideos = res.data.filter(
          (video: any) =>
            String(video.uploader) === String(id)
        );

        setVideos(channelVideos);
      } catch (error) {
        console.error("Error fetching channel videos:", error);
      } finally {
        setLoadingVideos(false);
      }
    };

    if (id) {
      fetchVideos();
    }
  }, [id]);

  // Fetch downloaded videos
  useEffect(() => {
    const fetchDownloads = async () => {
      if (!user?._id) return;

      try {
        const res = await axiosInstance.get(`/download/${user._id}`);

        setDownloads(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchDownloads();
  }, [user]);

  // Remove video from UI after successful deletion
  const handleDeleteVideo = (videoId: string) => {
    setVideos((currentVideos) =>
      currentVideos.filter(
        (video) => video._id !== videoId
      )
    );
  };

  // If channel/user isn't ready yet
  if (!router.isReady) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex-1 bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
      <div className="max-w-full mx-auto">

        <ChannelHeader
          channel={user}
          user={user}
        />

        <Channeltabs />

        {/* Upload only on your own channel */}
        {isOwnChannel && (
          <div className="px-4 pb-8">
            <VideoUploader
              channelId={id}
              channelName={user?.channelname}
            />
          </div>
        )}

        {/* Channel videos */}
        <div className="px-4 pb-8">
          <h2 className="text-2xl font-bold mb-4">
            {isOwnChannel ? "Your Videos" : "Videos"}
          </h2>

          {loadingVideos ? (
            <p>Loading videos...</p>
          ) : videos.length === 0 ? (
            <p className="text-gray-500">
              No videos uploaded yet.
            </p>
          ) : (
            <ChannelVideos
              videos={videos}
              showDelete={isOwnChannel}
              onDelete={handleDeleteVideo}
            />
          )}
        </div>

        {/* Downloaded videos */}
        <div className="px-4 pb-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Downloaded Videos
          </h2>

          {downloads.length === 0 ? (
            <p>No downloaded videos.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {downloads.map((item: any) => (
                <div
                  key={item._id}
                  className="border rounded-lg p-4"
                >
                  <div className="rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {item.videotitle}
                    </h3>

                    <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        Plan: {item.userPlan}
                      </p>

                      <p>
                        ⬇ Downloads: {item.downloadCount}
                      </p>

                      <p>
                        {new Date(
                          item.downloadDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default index;