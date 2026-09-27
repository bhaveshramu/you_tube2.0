import React, { useEffect, useState } from "react";
import Videocard from "./videocard";
import axiosInstance from "@/lib/axiosinstance";

const Videogrid = ({ showDelete = false }: { showDelete?: boolean }) => {
  const [videos, setvideo] = useState<any[]>([]);
  const [loading, setloading] = useState(true);

  useEffect(() => {
    const fetchvideo = async () => {
      try {
        const res = await axiosInstance.get("/video/getall");
        setvideo(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };

    fetchvideo();
  }, []);

  const handleDelete = (videoId: string) => {
    setvideo((currentVideos) =>
      currentVideos.filter((video) => video._id !== videoId)
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {loading ? (
        <p>Loading...</p>
      ) : videos.length === 0 ? (
        <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
          No videos available.
        </p>
      ) : (
        videos.map((video: any) => (
          <Videocard
            key={video._id}
            video={video}
            showDelete={showDelete}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  );
};

export default Videogrid;