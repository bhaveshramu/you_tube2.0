"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {Socket} from "socket.io-client";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  SkipForward,
  Loader2,
} from "lucide-react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const getFileUrl = (filePath: string | undefined) => {
  if (!filePath) return undefined;

  if (
    filePath.startsWith("http://") ||
    filePath.startsWith("https://")
  ) {
    return filePath;
  }

  return `${BACKEND_URL}/${filePath.replace(/\\/g, "/")}`;
};

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
    thumbnail?: string;
    duration?: number;
  };
  
  // Optional callback for the next video
  onNext?: () => void;
  partySocket?: Socket | null;
  partyId?: string;
}

export default function VideoPlayer({
  video,
  onNext,
  partySocket,
  partyId,
}: VideoPlayerProps) {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const containerRef =
    useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [isMuted, setIsMuted] =
    useState(false);

  const [volume, setVolume] =
    useState(1);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isFullscreen, setIsFullscreen] =
    useState(false);

  const [lastTap, setLastTap] =
    useState(0);

  const isRemoteAction=
    useRef(false);

    useEffect(() => {
      console.log("partySocket:", partySocket?.id);
      console.log("partyId:", partyId);
    }, [partySocket, partyId]);

  // Play / Pause
  const togglePlay = async () => {
  const videoElement =
    videoRef.current;

  if (!videoElement) return;

  try {
    if (videoElement.paused) {
      await videoElement.play();

      if (
        partySocket &&
        partyId &&
        !isRemoteAction.current
      ) {
        partySocket.emit(
          "video-play",
          {
            partyId,
            currentTime:
              videoElement.currentTime,
          }
        );
      }
    } else {
      videoElement.pause();

      if (
        partySocket &&
        partyId &&
        !isRemoteAction.current
      ) {
        partySocket.emit(
          "video-pause",
          {
            partyId,
            currentTime:
              videoElement.currentTime,
          }
        );
      }
    }
  } catch (error) {
    console.error(
      "Playback error:",
      error
    );
  }
};

  // Skip forward 10 seconds
  const skipForward = () => {
  const videoElement = videoRef.current;

  if (!videoElement) return;

  const newTime = Math.min(
    videoElement.currentTime + 10,
    videoElement.duration || Infinity
  );

  videoElement.currentTime = newTime;
  setCurrentTime(newTime);

  if (
    partySocket &&
    partyId &&
    !isRemoteAction.current
  ) {
    partySocket.emit("video-seek", {
      partyId,
      currentTime: newTime,
    });
  }
};

  // Rewind 10 seconds
  const skipBackward = () => {
  const videoElement = videoRef.current;

  if (!videoElement) return;

  const newTime = Math.max(
    videoElement.currentTime - 10,
    0
  );

  videoElement.currentTime = newTime;
  setCurrentTime(newTime);

  if (
    partySocket &&
    partyId &&
    !isRemoteAction.current
  ) {
    partySocket.emit("video-seek", {
      partyId,
      currentTime: newTime,
    });
  }
};

  // Volume
  const handleVolume = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number(e.target.value);

    setVolume(value);

    if (videoRef.current) {
      videoRef.current.volume = value;
      videoRef.current.muted =
        value === 0;

      setIsMuted(value === 0);
    }
  };

  // Mute / Unmute
  const toggleMute = () => {
    const videoElement =
      videoRef.current;

    if (!videoElement) return;

    if (videoElement.muted) {
      videoElement.muted = false;

      if (videoElement.volume === 0) {
        videoElement.volume = 1;
        setVolume(1);
      }

      setIsMuted(false);
    } else {
      videoElement.muted = true;
      setIsMuted(true);
    }
  };

  // Seek
 const handleSeek = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const value = Number(e.target.value);

  if (videoRef.current) {
    videoRef.current.currentTime =
      value;
  }

  setCurrentTime(value);

  if (
    partySocket &&
    partyId &&
    !isRemoteAction.current
  ) {
    partySocket.emit(
      "video-seek",
      {
        partyId,
        currentTime: value,
      }
    );
  }
};

  // Fullscreen
  const toggleFullscreen = async () => {
    const container =
      containerRef.current;

    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error(
        "Fullscreen error:",
        error
      );
    }
  };

  // Format time
  const formatTime = (
    time: number
  ) => {
    if (!Number.isFinite(time)) {
      return "0:00";
    }

    const minutes = Math.floor(
      time / 60
    );

    const seconds = Math.floor(
      time % 60
    );

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Mobile double-tap
  const handleVideoTap = (
    e: React.MouseEvent<HTMLVideoElement>
  ) => {
    const now = Date.now();

    if (now - lastTap < 300) {
      const rect =
        e.currentTarget.getBoundingClientRect();

      const tapPosition =
        e.clientX - rect.left;

      const half =
        rect.width / 2;

      if (tapPosition < half) {
        skipBackward();
      } else {
        skipForward();
      }
    }

    setLastTap(now);
  };

  // Video events
  useEffect(() => {
    const videoElement =
      videoRef.current;

    if (!videoElement) return;

    const handleLoadedMetadata =
  () => {
    const videoDuration =
      videoElement.duration;

    console.log(
      "VIDEO DURATION:",
      videoDuration,
      "seconds"
    );

    if (
      Number.isFinite(videoDuration) &&
      videoDuration > 0
    ) {
      setDuration(videoDuration);
    }

    setIsLoading(false);
  };

    const handleTimeUpdate =
      () => {
        setCurrentTime(
          videoElement.currentTime
        );
      };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);

      if (onNext) {
        onNext();
      }
    };

    videoElement.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    videoElement.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    videoElement.addEventListener(
      "play",
      handlePlay
    );

    videoElement.addEventListener(
      "pause",
      handlePause
    );

    videoElement.addEventListener(
      "waiting",
      handleWaiting
    );

    videoElement.addEventListener(
      "playing",
      handlePlaying
    );

    videoElement.addEventListener(
      "ended",
      handleEnded
    );

    return () => {
      videoElement.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );

      videoElement.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );

      videoElement.removeEventListener(
        "play",
        handlePlay
      );

      videoElement.removeEventListener(
        "pause",
        handlePause
      );

      videoElement.removeEventListener(
        "waiting",
        handleWaiting
      );

      videoElement.removeEventListener(
        "playing",
        handlePlaying
      );

      videoElement.removeEventListener(
        "ended",
        handleEnded
      );
    };
  }, [onNext]);

  // Detect fullscreen changes
  useEffect(() => {
    const handleFullscreenChange =
      () => {
        setIsFullscreen(
          Boolean(document.fullscreenElement)
        );
      };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  useEffect(() => {
  if (!partySocket || !partyId) {
    return;
  }

  const handleRemotePlay = ({
    currentTime,
  }: {
    currentTime: number;
  }) => {
    const videoElement =
      videoRef.current;

    if (!videoElement) return;

    isRemoteAction.current = true;

    videoElement.currentTime =
      currentTime;

    videoElement
      .play()
      .catch((error) => {
        console.error(
          "Remote play error:",
          error
        );
      });

    setTimeout(() => {
      isRemoteAction.current = false;
    }, 100);
  };

  const handleRemotePause = ({
    currentTime,
  }: {
    currentTime: number;
  }) => {
    const videoElement =
      videoRef.current;

    if (!videoElement) return;

    isRemoteAction.current = true;

    videoElement.currentTime =
      currentTime;

    videoElement.pause();

    setTimeout(() => {
      isRemoteAction.current = false;
    }, 100);
  };

  const handleRemoteSeek = ({
    currentTime,
  }: {
    currentTime: number;
  }) => {
    const videoElement =
      videoRef.current;

    if (!videoElement) return;

    isRemoteAction.current = true;

    videoElement.currentTime =
      currentTime;

    setCurrentTime(currentTime);

    setTimeout(() => {
      isRemoteAction.current = false;
    }, 100);
  };

  const handleInitialState = ({
    currentTime,
    isPlaying,
  }: {
    currentTime: number;
    isPlaying: boolean;
  }) => {
    const videoElement =
      videoRef.current;

    if (!videoElement) return;

    isRemoteAction.current = true;

    videoElement.currentTime =
      currentTime;

    setCurrentTime(currentTime);

    if (isPlaying) {
      videoElement
        .play()
        .catch((error) => {
          console.error(
            "Initial sync play error:",
            error
          );
        });
    } else {
      videoElement.pause();
    }

    setTimeout(() => {
      isRemoteAction.current = false;
    }, 100);
  };

  partySocket.on(
    "video-play",
    handleRemotePlay
  );

  partySocket.on(
    "video-pause",
    handleRemotePause
  );

  partySocket.on(
    "video-seek",
    handleRemoteSeek
  );

  partySocket.on(
    "video-state",
    handleInitialState
  );

  return () => {
    partySocket.off(
      "video-play",
      handleRemotePlay
    );

    partySocket.off(
      "video-pause",
      handleRemotePause
    );

    partySocket.off(
      "video-seek",
      handleRemoteSeek
    );

    partySocket.off(
      "video-state",
      handleInitialState
    );
  };
}, [partySocket, partyId]);

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-lg overflow-hidden group"
    >
      {/* Video */}
     <video
  ref={videoRef}
  className="w-full h-full object-contain"
  poster={getFileUrl(video?.thumbnail)}
  preload="metadata"
  onClick={handleVideoTap}
  playsInline
>
  <source
    src={getFileUrl(video?.filepath)}
    type="video/mp4"
  />

  Your browser does not support the video tag.
</video>

      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      )}

      {/* Center controls */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {!isPlaying && !isLoading && (
          <button
            onClick={togglePlay}
            className="pointer-events-auto bg-black/60 hover:bg-black/80 text-white rounded-full p-4"
          >
            <Play className="w-8 h-8 fill-white" />
          </button>
        )}
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 opacity-100 sm:group-hover:opacity-100 transition-opacity">
        {/* Progress */}
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="w-full mb-2 cursor-pointer"
        />

        <div className="flex items-center gap-2 text-white">
          {/* Play */}
          <button
            onClick={togglePlay}
            title={
              isPlaying ? "Pause" : "Play"
            }
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white" />
            )}
          </button>

          {/* Rewind */}
          <button
            onClick={skipBackward}
            title="Rewind 10 seconds"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Forward */}
          <button
            onClick={skipForward}
            title="Forward 10 seconds"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          {/* Volume */}
          <button
            onClick={toggleMute}
            title={
              isMuted
                ? "Unmute"
                : "Mute"
            }
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={
              isMuted ? 0 : volume
            }
            onChange={handleVolume}
            className="w-20 cursor-pointer"
          />

          {/* Time */}
          <span className="text-sm whitespace-nowrap">
            {formatTime(currentTime)} /{" "}
            {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* Next */}
          {onNext && (
            <button
              onClick={onNext}
              title="Next video"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title={
              isFullscreen
                ? "Exit fullscreen"
                : "Fullscreen"
            }
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}