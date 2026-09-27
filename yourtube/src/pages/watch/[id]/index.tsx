import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import Videopplayer from "@/components/Videopplayer";
import WatchParty from "@/components/WatchParty";
import {Socket} from "socket.io-client";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { useUser } from "@/lib/AuthContext";

const index = () => {
  const router = useRouter();
  const { id } = router.query;

  const [videos, setvideo] = useState<any>(null);
  const [video, setvide] = useState<any>(null);
  const [loading, setloading] = useState(true);
  const [partySocket, setPartySocket] = useState<Socket | null>(null);
  const [partyId, setPartyId] = useState("");
  const handlePartyReady = useCallback(
    (socket: Socket | null, id: string) => {
      setPartySocket(socket);
      setPartyId(id);
    },
    []
  );

  const { user } = useUser();

  useEffect(() => {
    const fetchvideo = async () => {
      if (!id || typeof id !== "string") return;

      try {
        const res = await axiosInstance.get("/video/getall");

        const currentVideo = res.data?.find(
          (vid: any) => vid._id === id
        );

        setvideo(currentVideo);
        setvide(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };

    fetchvideo();
  }, [id]);

  // Find next video
  const handleNextVideo = () => {
    if (!videos || !video || video.length === 0) {
      return;
    }

    const currentIndex = video.findIndex(
      (vid: any) => vid._id === videos._id
    );

    if (currentIndex === -1) {
      return;
    }

    const nextIndex =
      (currentIndex + 1) % video.length;

    const nextVideo = video[nextIndex];

    router.push(`/watch/${nextVideo._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black dark:bg-gray-950 dark:text-white p-4">
        Loading...
      </div>
    );
  }

  if (!videos) {
    return (
      <div className="min-h-screen bg-white text-black dark:bg-gray-950 dark:text-white p-4">
        Video not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-950 dark:text-white">
      <div className="w-full max-w-7xl mx-auto p-2 sm:p-4">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">

          {/* Main video */}
          <div className="lg:col-span-2 space-y-4 min-w-0">

            <Videopplayer
              video={videos}
              onNext={handleNextVideo}
              partySocket={partySocket}
              partyId={partyId}
            />
            

            <VideoInfo video={videos} />
            {user && (
              <WatchParty 
            username={String(user.name ||
              user.username ||
              user.email || "User"
            )
            }
            videoId={(videos._id)}
            onPartyReady={handlePartyReady}
          />
          )}

            <Comments videoId={id} />

          </div>

          {/* Related videos */}
          <div className="space-y-4 min-w-0">
            <RelatedVideos videos={video} />
          </div>

        </div>

      </div>
    </div>
  );
};

export default index;