"use client";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { Socket } from "socket.io-client";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  MonitorUp,
  MonitorOff,
  Circle,
  Square,
} from "lucide-react";

// ======================================================
// TYPES
// ======================================================

interface CallUser {
  socketId: string;
  username: string;
}

interface RemoteStream {
  socketId: string;
  username: string;
  stream: MediaStream;
}

interface VideoCallProps {
  socket: Socket;
  partyId: string;
  username: string;
  participants: CallUser[];
  isHost?: boolean;
}

// ======================================================
// COMPONENT
// ======================================================

const VideoCall: React.FC<VideoCallProps> = ({
  socket,
  partyId,
  username,
  participants,
  isHost = false,
}) => {
  // ====================================================
  // VIDEO REFS
  // ====================================================

  const localVideoRef =
    useRef<HTMLVideoElement | null>(null);

  const localStreamRef =
    useRef<MediaStream | null>(null);

  const peerConnectionsRef =
    useRef<Map<string, RTCPeerConnection>>(
      new Map()
    );

  // Queue ICE candidates that arrive before
  // the remote description is ready.
  const pendingIceCandidatesRef =
    useRef<
      Map<string, RTCIceCandidateInit[]>
    >(new Map());

  // Prevent multiple offers at the same time.
  const creatingOfferRef =
    useRef<Set<string>>(new Set());

  const participantsRef =
    useRef<CallUser[]>(participants);

  const mountedRef =
    useRef(true);

  // ====================================================
  // RECORDING REFS
  // ====================================================

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const recordedChunksRef =
    useRef<Blob[]>([]);

  // ====================================================
  // STATE
  // ====================================================

  const [remoteStreams, setRemoteStreams] =
    useState<RemoteStream[]>([]);

  const [isMuted, setIsMuted] =
    useState(false);

  const [isCameraOff, setIsCameraOff] =
    useState(false);

  const [callStarted, setCallStarted] =
    useState(false);

  const [isScreenSharing, setIsScreenSharing] =
    useState(false);

  const [isRecording, setIsRecording] =
    useState(false);

  const [error, setError] =
    useState("");

  // ====================================================
  // KEEP PARTICIPANTS REF UPDATED
  // ====================================================

  useEffect(() => {
    participantsRef.current =
      participants;
  }, [participants]);

  // ====================================================
  // WEBRTC CONFIG
  // ====================================================

  const rtcConfig: RTCConfiguration = {
    iceServers: [
      {
        urls:
          "stun:stun.l.google.com:19302",
      },
    ],
  };

  // ====================================================
  // START CAMERA + MICROPHONE
  // ====================================================

  const startLocalStream =
    async (): Promise<boolean> => {
      try {
        if (
          typeof navigator ===
          "undefined" ||
          !navigator.mediaDevices ||
          !navigator.mediaDevices
            .getUserMedia
        ) {
          setError(
            "Camera and microphone are not available. HTTPS or localhost is required."
          );

          console.error(
            "getUserMedia is unavailable"
          );

          return false;
        }

        console.log(
          "Requesting camera and microphone..."
        );

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: true,
              audio: true,
            }
          );

        localStreamRef.current =
          stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject =
            stream;

          await localVideoRef.current
            .play()
            .catch(() => { });
        }

        if (mountedRef.current) {
          setCallStarted(true);
        }

        console.log(
          "Camera and microphone started successfully"
        );

        return true;
      } catch (err) {
        console.error(
          "Failed to access camera/microphone:",
          err
        );

        setError(
          "Unable to access camera or microphone."
        );

        return false;
      }
    };

  // ====================================================
  // CREATE PEER CONNECTION
  // ====================================================

  const createPeerConnection = (
    targetSocketId: string,
    targetUsername: string
  ) => {
    // Prevent connecting to ourselves
    if (targetSocketId === socket.id) {
      console.log(
        "Ignoring self peer connection:",
        targetSocketId
      );

      return null;
    }
    const existing =
      peerConnectionsRef.current.get(
        targetSocketId
      );

    if (existing) {
      return existing;
    }

    console.log(
      "Creating peer connection:",
      targetUsername,
      targetSocketId
    );

    const peerConnection =
      new RTCPeerConnection(
        rtcConfig
      );

    // --------------------------------------------------
    // ADD LOCAL AUDIO + VIDEO
    // --------------------------------------------------

    const localStream =
      localStreamRef.current;

    if (localStream) {
      localStream
        .getTracks()
        .forEach((track) => {
          peerConnection.addTrack(
            track,
            localStream
          );
        });
    }

    // --------------------------------------------------
    // RECEIVE REMOTE MEDIA
    // --------------------------------------------------

    peerConnection.ontrack = (
      event
    ) => {
      // Never display our own stream as remote
      if (targetSocketId === socket.id) {
        console.log(
          "Ignoring own remote track:",
          targetSocketId
        );

        return;
      }
      console.log(
        "REMOTE TRACK RECEIVED:",
        targetUsername,
        event.track.kind,
        event.track.label
      );

      let stream =
        event.streams[0];

      if (!stream) {
        stream =
          new MediaStream();

        stream.addTrack(
          event.track
        );
      }

      setRemoteStreams(
        (previous) => {
          const existingUser =
            previous.find(
              (item) =>
                item.socketId ===
                targetSocketId
            );

          if (existingUser) {
            return previous.map(
              (item) =>
                item.socketId ===
                  targetSocketId
                  ? {
                    ...item,
                    stream,
                  }
                  : item
            );
          }

          return [
            ...previous,
            {
              socketId:
                targetSocketId,
              username:
                targetUsername,
              stream,
            },
          ];
        }
      );
    };

    // --------------------------------------------------
    // ICE CANDIDATES
    // --------------------------------------------------

    peerConnection.onicecandidate =
      (event) => {
        if (!event.candidate) {
          return;
        }

        console.log(
          "Sending ICE candidate to:",
          targetUsername
        );

        socket.emit(
          "webrtc-ice-candidate",
          {
            targetSocketId,
            candidate:
              event.candidate,
          }
        );
      };

    // --------------------------------------------------
    // CONNECTION STATE
    // --------------------------------------------------

    peerConnection.onconnectionstatechange =
      () => {
        console.log(
          `WebRTC connection with ${targetUsername}:`,
          peerConnection.connectionState
        );

        if (
          peerConnection.connectionState ===
          "failed" ||
          peerConnection.connectionState ===
          "closed"
        ) {
          removePeer(
            targetSocketId
          );
        }
      };

    // --------------------------------------------------
    // ICE CONNECTION STATE
    // --------------------------------------------------

    peerConnection.oniceconnectionstatechange =
      () => {
        console.log(
          `ICE connection with ${targetUsername}:`,
          peerConnection.iceConnectionState
        );
      };

    peerConnectionsRef.current.set(
      targetSocketId,
      peerConnection
    );

    return peerConnection;
  };

  // ====================================================
  // REMOVE PEER
  // ====================================================

  const removePeer = (
    socketId: string
  ) => {
    console.log(
      "Removing peer:",
      socketId
    );

    const peer =
      peerConnectionsRef.current.get(
        socketId
      );

    if (peer) {
      peer.close();

      peerConnectionsRef.current.delete(
        socketId
      );
    }

    creatingOfferRef.current.delete(
      socketId
    );

    pendingIceCandidatesRef.current.delete(
      socketId
    );

    setRemoteStreams(
      (previous) =>
        previous.filter(
          (item) =>
            item.socketId !==
            socketId
        )
    );
  };

  // ====================================================
  // CREATE OFFER
  // ====================================================

  const createOffer = async (
    targetSocketId: string,
    targetUsername: string
  ) => {
    if (targetSocketId === socket.id) {
      console.log(
        "Ignoring offer to self:",
        targetSocketId
      );

      return;
    }
    if (
      creatingOfferRef.current.has(
        targetSocketId
      )
    ) {
      console.log(
        "Offer already being created:",
        targetUsername
      );

      return;
    }

    const peerConnection =
      createPeerConnection(
        targetSocketId,
        targetUsername
      );
    if (!peerConnection) {
      return;
    }

    if (
      peerConnection.signalingState !==
      "stable"
    ) {
      console.log(
        "Cannot create offer. Current state:",
        peerConnection.signalingState
      );

      return;
    }

    creatingOfferRef.current.add(
      targetSocketId
    );

    try {
      console.log(
        "Creating offer for:",
        targetUsername
      );

      const offer =
        await peerConnection.createOffer();

      await peerConnection.setLocalDescription(
        offer
      );

      socket.emit(
        "webrtc-offer",
        {
          targetSocketId,
          offer,
        }
      );

      console.log(
        "OFFER SENT TO:",
        targetUsername
      );
    } catch (err) {
      console.error(
        "Offer creation error:",
        err
      );
    } finally {
      creatingOfferRef.current.delete(
        targetSocketId
      );
    }
  };

  // ====================================================
  // HANDLE OFFER
  // ====================================================

  const handleOffer = async ({
    senderSocketId,
    offer,
  }: {
    senderSocketId: string;
    offer: RTCSessionDescriptionInit;
  }) => {
    if (senderSocketId === socket.id) {
      console.log(
        "Ignoring offer from self:",
        senderSocketId
      );

      return;
    }
    try {
      console.log(
        "INCOMING OFFER FROM:",
        senderSocketId
      );

      const participant =
        participantsRef.current.find(
          (item) =>
            item.socketId ===
            senderSocketId
        );

      const targetUsername =
        participant?.username ||
        "Participant";

      const peerConnection =
        createPeerConnection(
          senderSocketId,
          targetUsername
        );
      if (!peerConnection) {
        return;
      }

      console.log(
        "Current signaling state:",
        peerConnection.signalingState
      );

      // Handle renegotiation safely.
      if (
        peerConnection.signalingState ===
        "have-local-offer"
      ) {
        console.log(
          "Replacing local offer with incoming offer."
        );

        await peerConnection.setLocalDescription(
          {
            type: "rollback",
          }
        );
      }

      if (
        peerConnection.signalingState !==
        "stable"
      ) {
        console.warn(
          "Cannot accept offer. State:",
          peerConnection.signalingState
        );

        return;
      }

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(
          offer
        )
      );

      // ------------------------------------------------
      // Add queued ICE candidates
      // ------------------------------------------------

      const pending =
        pendingIceCandidatesRef.current.get(
          senderSocketId
        );

      if (pending) {
        for (const candidate of pending) {
          try {
            await peerConnection.addIceCandidate(
              new RTCIceCandidate(
                candidate
              )
            );
          } catch (err) {
            console.error(
              "Queued ICE error:",
              err
            );
          }
        }

        pendingIceCandidatesRef.current.delete(
          senderSocketId
        );
      }

      // ------------------------------------------------
      // CREATE ANSWER
      // ------------------------------------------------

      const answer =
        await peerConnection.createAnswer();

      await peerConnection.setLocalDescription(
        answer
      );

      socket.emit(
        "webrtc-answer",
        {
          targetSocketId:
            senderSocketId,
          answer,
        }
      );

      console.log(
        "ANSWER SENT TO:",
        targetUsername
      );
    } catch (err) {
      console.error(
        "Offer handling error:",
        err
      );
    }
  };

  // ====================================================
  // HANDLE ANSWER
  // ====================================================

  const handleAnswer = async ({
    senderSocketId,
    answer,
  }: {
    senderSocketId: string;
    answer: RTCSessionDescriptionInit;
  }) => {
    if (senderSocketId === socket.id) {
      console.log(
        "Ignoring answer from self:",
        senderSocketId
      );

      return;
    }
    try {
      console.log(
        "INCOMING ANSWER FROM:",
        senderSocketId
      );

      const peerConnection =
        peerConnectionsRef.current.get(
          senderSocketId
        );

      if (!peerConnection) {
        console.warn(
          "Peer connection not found for answer."
        );

        return;
      }

      if (
        peerConnection.signalingState !==
        "have-local-offer"
      ) {
        console.warn(
          "Ignoring answer. Current state:",
          peerConnection.signalingState
        );

        return;
      }

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(
          answer
        )
      );

      console.log(
        "ANSWER APPLIED:",
        senderSocketId
      );

      // Add any queued ICE candidates.
      const pending =
        pendingIceCandidatesRef.current.get(
          senderSocketId
        );

      if (pending) {
        for (const candidate of pending) {
          try {
            await peerConnection.addIceCandidate(
              new RTCIceCandidate(
                candidate
              )
            );
          } catch (err) {
            console.error(
              "Queued ICE error:",
              err
            );
          }
        }

        pendingIceCandidatesRef.current.delete(
          senderSocketId
        );
      }
    } catch (err) {
      console.error(
        "Answer handling error:",
        err
      );
    }
  };

  // ====================================================
  // HANDLE ICE
  // ====================================================

  const handleIceCandidate = async ({
    senderSocketId,
    candidate,
  }: {
    senderSocketId: string;
    candidate: RTCIceCandidateInit;
  }) => {
    if (senderSocketId === socket.id) {
      console.log(
        "Ignoring ICE candidate from self:",
        senderSocketId
      );

      return;
    }
    try {
      const peerConnection =
        peerConnectionsRef.current.get(
          senderSocketId
        );

      if (
        !peerConnection ||
        !peerConnection.remoteDescription
      ) {
        console.log(
          "Queueing ICE candidate:",
          senderSocketId
        );

        const existing =
          pendingIceCandidatesRef.current.get(
            senderSocketId
          ) || [];

        existing.push(candidate);

        pendingIceCandidatesRef.current.set(
          senderSocketId,
          existing
        );

        return;
      }

      await peerConnection.addIceCandidate(
        new RTCIceCandidate(
          candidate
        )
      );
    } catch (err) {
      console.error(
        "ICE candidate error:",
        err
      );
    }
  };

  // ====================================================
  // INITIALIZE WEBRTC
  // ====================================================

  useEffect(() => {
    mountedRef.current = true;

    if (!socket || !partyId) {
      console.log(
        "WebRTC waiting for socket/party:",
        {
          socket: !!socket,
          partyId,
        }
      );

      return;
    }

    let active = true;

    console.log(
      "================================"
    );

    console.log(
      "INITIALIZING WEBRTC CALL"
    );

    console.log(
      "Socket ID:",
      socket.id
    );

    console.log(
      "Party ID:",
      partyId
    );

    console.log(
      "Username:",
      username
    );

    console.log(
      "================================"
    );

    // --------------------------------------------------
    // REGISTER SOCKET LISTENERS FIRST
    // --------------------------------------------------

    const handleExistingUsers = ({
      users,
    }: {
      users: CallUser[];
    }) => {
      console.log(
        "EXISTING CALL USERS:",
        users
      );

      users.forEach((user) => {
        createOffer(
          user.socketId,
          user.username
        );
      });
    };

    const handleUserJoined = ({
      socketId,
      username: newUsername,
    }: {
      socketId: string;
      username: string;
    }) => {
      console.log(
        "NEW USER JOINED CALL:",
        newUsername,
        socketId
      );
    };

    const handleUserLeft = ({
      socketId,
    }: {
      socketId: string;
    }) => {
      console.log(
        "USER LEFT CALL:",
        socketId
      );

      removePeer(socketId);
    };

    socket.on(
      "call-existing-users",
      handleExistingUsers
    );

    socket.on(
      "call-user-joined",
      handleUserJoined
    );

    socket.on(
      "webrtc-offer",
      handleOffer
    );

    socket.on(
      "webrtc-answer",
      handleAnswer
    );

    socket.on(
      "webrtc-ice-candidate",
      handleIceCandidate
    );

    socket.on(
      "call-user-left",
      handleUserLeft
    );

    // --------------------------------------------------
    // START MEDIA THEN JOIN CALL
    // --------------------------------------------------

    const initialize = async () => {
      console.log(
        "Starting local media..."
      );

      const streamStarted =
        await startLocalStream();

      if (!streamStarted) {
        console.error(
          "Local media failed. WebRTC call not started."
        );

        return;
      }

      if (!active) {
        return;
      }

      console.log(
        "Local media ready."
      );

      // ------------------------------------------------
      // JOIN CALL
      // ------------------------------------------------

      const joinCall = () => {
        console.log(
          "EMITTING join-call:",
          partyId,
          username
        );

        socket.emit(
          "join-call",
          {
            partyId,
            username,
          }
        );

        console.log(
          "JOINED VIDEO CALL:",
          partyId
        );
      };

      if (socket.connected) {
        joinCall();
      } else {
        console.log(
          "Socket not connected yet. Waiting..."
        );

        socket.once(
          "connect",
          joinCall
        );
      }
    };

    initialize();

    // --------------------------------------------------
    // CLEANUP
    // --------------------------------------------------

    return () => {
      active = false;
      mountedRef.current = false;

      console.log(
        "Cleaning up WebRTC call..."
      );

      socket.off(
        "call-existing-users",
        handleExistingUsers
      );

      socket.off(
        "call-user-joined",
        handleUserJoined
      );

      socket.off(
        "webrtc-offer",
        handleOffer
      );

      socket.off(
        "webrtc-answer",
        handleAnswer
      );

      socket.off(
        "webrtc-ice-candidate",
        handleIceCandidate
      );

      socket.off(
        "call-user-left",
        handleUserLeft
      );

    };
  }, [socket, partyId, username]);

  // ====================================================
  // MUTE
  // ====================================================

  const toggleMute = () => {
    const stream =
      localStreamRef.current;

    if (!stream) return;

    stream
      .getAudioTracks()
      .forEach(
        (track) => {
          track.enabled =
            !track.enabled;
        }
      );

    setIsMuted(
      (previous) => !previous
    );
  };

  // ====================================================
  // CAMERA
  // ====================================================

  const toggleCamera = () => {
    const stream =
      localStreamRef.current;

    if (!stream) return;

    stream
      .getVideoTracks()
      .forEach(
        (track) => {
          track.enabled =
            !track.enabled;
        }
      );

    setIsCameraOff(
      (previous) => !previous
    );
  };

  // ====================================================
  // REPLACE VIDEO TRACK
  // ====================================================

  const replaceVideoTrack = async (
    newTrack: MediaStreamTrack
  ) => {
    console.log(
      "================================"
    );

    console.log(
      "REPLACING VIDEO TRACK"
    );

    console.log(
      "New track:",
      newTrack.kind,
      newTrack.label
    );

    console.log(
      "Peers:",
      peerConnectionsRef.current.size
    );

    console.log(
      "================================"
    );

    for (const [
      socketId,
      peerConnection,
    ] of peerConnectionsRef.current) {
      try {
        const videoSender =
          peerConnection
            .getSenders()
            .find(
              (sender) =>
                sender.track?.kind ===
                "video"
            );

        if (!videoSender) {
          console.warn(
            "No video sender found:",
            socketId
          );

          continue;
        }

        await videoSender.replaceTrack(
          newTrack
        );

        console.log(
          "TRACK REPLACED FOR:",
          socketId
        );

        // ------------------------------------------------
        // Renegotiate
        // ------------------------------------------------

        if (
          peerConnection.signalingState ===
          "stable"
        ) {
          console.log(
            "Creating renegotiation offer:",
            socketId
          );

          const offer =
            await peerConnection.createOffer();

          await peerConnection.setLocalDescription(
            offer
          );

          socket.emit(
            "webrtc-offer",
            {
              targetSocketId:
                socketId,
              offer,
            }
          );

          console.log(
            "RENEGOTIATION OFFER SENT:",
            socketId
          );
        } else {
          console.log(
            "Skipping renegotiation. State:",
            peerConnection.signalingState
          );
        }
      } catch (err) {
        console.error(
          "Track replacement error:",
          socketId,
          err
        );
      }
    }
  };

  // ====================================================
  // SCREEN SHARING
  // ====================================================

  const toggleScreenShare =
    async () => {
      // ------------------------------------------------
      // STOP SCREEN SHARING
      // ------------------------------------------------

      if (isScreenSharing) {
        const cameraTrack =
          localStreamRef.current
            ?.getVideoTracks()[0];

        if (!cameraTrack) {
          console.warn(
            "Camera track not available."
          );

          return;
        }

        try {
          console.log(
            "Stopping screen sharing..."
          );

          await replaceVideoTrack(
            cameraTrack
          );

          if (localVideoRef.current) {
            localVideoRef.current.srcObject =
              localStreamRef.current;

            await localVideoRef.current
              .play()
              .catch(() => { });
          }

          setIsScreenSharing(
            false
          );

          console.log(
            "Camera restored."
          );
        } catch (err) {
          console.error(
            "Failed to restore camera:",
            err
          );
        }

        return;
      }

      // ------------------------------------------------
      // START SCREEN SHARING
      // ------------------------------------------------

      try {
        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices
            .getDisplayMedia
        ) {
          setError(
            "Screen sharing is not supported by this browser."
          );

          return;
        }

        console.log(
          "Requesting screen sharing..."
        );

        const screenStream =
          await navigator.mediaDevices.getDisplayMedia(
            {
              video: true,
              audio: false,
            }
          );

        const screenTrack =
          screenStream.getVideoTracks()[0];

        if (!screenTrack) {
          console.error(
            "No screen track found."
          );

          return;
        }

        console.log(
          "SCREEN TRACK:",
          screenTrack.label
        );

        // Send screen to remote participants.
        await replaceVideoTrack(
          screenTrack
        );

        // Show screen locally.
        if (localVideoRef.current) {
          localVideoRef.current.srcObject =
            screenStream;

          await localVideoRef.current
            .play()
            .catch(() => { });
        }

        setIsScreenSharing(
          true
        );

        console.log(
          "SCREEN SHARING STARTED"
        );

        // ------------------------------------------------
        // Browser Stop Sharing button
        // ------------------------------------------------

        screenTrack.onended =
          async () => {
            console.log(
              "Browser stopped screen sharing."
            );

            const cameraTrack =
              localStreamRef.current
                ?.getVideoTracks()[0];

            if (!cameraTrack) {
              return;
            }

            try {
              await replaceVideoTrack(
                cameraTrack
              );

              if (
                localVideoRef.current
              ) {
                localVideoRef.current.srcObject =
                  localStreamRef.current;

                await localVideoRef.current
                  .play()
                  .catch(() => { });
              }

              setIsScreenSharing(
                false
              );

              console.log(
                "Camera restored after browser stop."
              );
            } catch (err) {
              console.error(
                "Camera restore error:",
                err
              );
            }
          };
      } catch (err) {
        console.error(
          "Screen sharing error:",
          err
        );
      }
    };

  // ====================================================
  // START RECORDING
  // ====================================================

  const startRecording = () => {
    if (!isHost) {
      return;
    }

    if (isRecording) {
      return;
    }

    const stream =
      localStreamRef.current;

    if (!stream) {
      setError(
        "Camera and microphone must be active before recording."
      );

      return;
    }

    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    if (
      !window.MediaRecorder
    ) {
      setError(
        "Recording is not supported by this browser."
      );

      return;
    }

    try {
      recordedChunksRef.current =
        [];

      let recordingStream =
        stream;

      // If screen sharing is active,
      // record the screen + microphone.
      if (isScreenSharing) {
        const currentSource =
          localVideoRef.current
            ?.srcObject;

        if (
          currentSource instanceof
          MediaStream
        ) {
          const screenTrack =
            currentSource
              .getVideoTracks()[0];

          const audioTrack =
            stream.getAudioTracks()[0];

          if (screenTrack) {
            recordingStream =
              new MediaStream();

            recordingStream.addTrack(
              screenTrack
            );

            if (audioTrack) {
              recordingStream.addTrack(
                audioTrack
              );
            }
          }
        }
      }

      let mimeType =
        "video/webm";

      if (
        MediaRecorder.isTypeSupported(
          "video/webm;codecs=vp9,opus"
        )
      ) {
        mimeType =
          "video/webm;codecs=vp9,opus";
      } else if (
        MediaRecorder.isTypeSupported(
          "video/webm;codecs=vp8,opus"
        )
      ) {
        mimeType =
          "video/webm;codecs=vp8,opus";
      }

      const recorder =
        new MediaRecorder(
          recordingStream,
          {
            mimeType,
          }
        );

      mediaRecorderRef.current =
        recorder;

      recorder.ondataavailable =
        (event) => {
          if (
            event.data.size > 0
          ) {
            recordedChunksRef.current.push(
              event.data
            );
          }
        };

      recorder.onstop = () => {
        const blob =
          new Blob(
            recordedChunksRef.current,
            {
              type: mimeType,
            }
          );

        const url =
          URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;

        link.download =
          `yourtube-watch-party-${Date.now()}.webm`;

        document.body.appendChild(
          link
        );

        link.click();

        document.body.removeChild(
          link
        );

        URL.revokeObjectURL(
          url
        );

        recordedChunksRef.current =
          [];

        console.log(
          "Recording saved locally."
        );
      };

      recorder.start(1000);

      setIsRecording(true);

      console.log(
        "Recording started."
      );
    } catch (err) {
      console.error(
        "Recording error:",
        err
      );

      setError(
        "Unable to start recording."
      );
    }
  };

  // ====================================================
  // STOP RECORDING
  // ====================================================

  const stopRecording = () => {
    if (!isHost) {
      return;
    }

    const recorder =
      mediaRecorderRef.current;

    if (
      !recorder ||
      recorder.state ===
      "inactive"
    ) {
      return;
    }

    console.log(
      "Stopping recording..."
    );

    recorder.stop();

    mediaRecorderRef.current =
      null;

    setIsRecording(
      false
    );
  };

  // ====================================================
  // LEAVE CALL
  // ====================================================

  const leaveCall = () => {
    console.log(
      "Leaving video call..."
    );

    // Stop recording.
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current
        .state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    mediaRecorderRef.current =
      null;

    recordedChunksRef.current =
      [];

    setIsRecording(false);

    // Tell server.
    socket.emit(
      "leave-call",
      {
        partyId,
      }
    );

    // Close peers.
    peerConnectionsRef.current.forEach(
      (peer) => {
        peer.close();
      }
    );

    peerConnectionsRef.current.clear();

    creatingOfferRef.current.clear();

    pendingIceCandidatesRef.current.clear();

    // Stop local media.
    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      localStreamRef.current =
        null;
    }

    // Clear local video.
    if (localVideoRef.current) {
      localVideoRef.current.srcObject =
        null;
    }

    setRemoteStreams([]);

    setCallStarted(false);

    setIsMuted(false);

    setIsCameraOff(false);

    setIsScreenSharing(false);
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900 sm:p-4">

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <Video
            size={20}
            className="text-red-600"
          />

          <h2 className="font-semibold">
            Video Call
          </h2>

        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500">

          <Users size={16} />

          <span>
            {remoteStreams.length + 1}
          </span>

        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Videos */}
      {callStarted && (
        <>

          <div
            className={`grid gap-3 ${remoteStreams.length === 0
              ? "grid-cols-1"
              : remoteStreams.length === 1
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-2"
              }`}
          >

            {/* LOCAL */}
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black">

              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover"
              />

              <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
                You
              </div>

              {isScreenSharing && (
                <div className="absolute right-2 top-2 rounded-md bg-blue-600 px-2 py-1 text-xs text-white">
                  Sharing screen
                </div>
              )}

            </div>

            {/* REMOTE */}
            {remoteStreams.map(
              (remote) => (
                <RemoteVideo
                  key={
                    remote.socketId
                  }
                  stream={
                    remote.stream
                  }
                  username={
                    remote.username
                  }
                />
              )
            )}

          </div>

          {/* CONTROLS */}
          <div className="mt-4 flex items-center justify-center gap-3">

            {/* MUTE */}
            <button
              onClick={toggleMute}
              title={
                isMuted
                  ? "Unmute microphone"
                  : "Mute microphone"
              }
              className={`flex h-11 w-11 items-center justify-center rounded-full text-white ${isMuted
                ? "bg-red-600"
                : "bg-gray-700 hover:bg-gray-600"
                }`}
            >
              {isMuted ? (
                <MicOff size={20} />
              ) : (
                <Mic size={20} />
              )}
            </button>

            {/* CAMERA */}
            <button
              onClick={toggleCamera}
              title={
                isCameraOff
                  ? "Turn camera on"
                  : "Turn camera off"
              }
              className={`flex h-11 w-11 items-center justify-center rounded-full text-white ${isCameraOff
                ? "bg-red-600"
                : "bg-gray-700 hover:bg-gray-600"
                }`}
            >
              {isCameraOff ? (
                <VideoOff size={20} />
              ) : (
                <Video size={20} />
              )}
            </button>

            {/* SCREEN SHARE */}
            <button
              onClick={
                toggleScreenShare
              }
              title={
                isScreenSharing
                  ? "Stop screen sharing"
                  : "Share screen"
              }
              className={`flex h-11 w-11 items-center justify-center rounded-full text-white ${isScreenSharing
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-700 hover:bg-gray-600"
                }`}
            >
              {isScreenSharing ? (
                <MonitorOff
                  size={20}
                />
              ) : (
                <MonitorUp
                  size={20}
                />
              )}
            </button>

            {/* HOST RECORDING */}
            {isHost && (
              <button
                onClick={
                  isRecording
                    ? stopRecording
                    : startRecording
                }
                title={
                  isRecording
                    ? "Stop recording"
                    : "Start recording"
                }
                className={`flex h-11 w-11 items-center justify-center rounded-full text-white ${isRecording
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-700 hover:bg-gray-600"
                  }`}
              >
                {isRecording ? (
                  <Square size={18} />
                ) : (
                  <Circle size={20} />
                )}
              </button>
            )}

            {/* LEAVE */}
            <button
              onClick={
                leaveCall
              }
              title="Leave call"
              className="flex h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-5 text-white hover:bg-red-700"
            >
              <PhoneOff
                size={20}
              />

              <span className="hidden sm:inline">
                Leave
              </span>
            </button>

          </div>

        </>
      )}

    </div>
  );
};

// ======================================================
// REMOTE VIDEO
// ======================================================

interface RemoteVideoProps {
  stream: MediaStream;
  username: string;
}

const RemoteVideo: React.FC<
  RemoteVideoProps
> = ({
  stream,
  username,
}) => {
    const videoRef =
      useRef<HTMLVideoElement | null>(
        null
      );

    useEffect(() => {
      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      console.log(
        "Attaching remote stream:",
        username,
        stream.getTracks().map(
          (track) => ({
            kind: track.kind,
            label: track.label,
            enabled: track.enabled,
            readyState:
              track.readyState,
          })
        )
      );

      video.srcObject =
        stream;

      video.play().catch(
        (error) => {
          console.log(
            "Remote video autoplay waiting:",
            error
          );
        }
      );

      return () => {
        if (
          video.srcObject ===
          stream
        ) {
          video.srcObject = null;
        }
      };
    }, [stream, username]);

    return (
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black">

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={false}
          className="h-full w-full object-cover"
        />

        <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
          {username}
        </div>

      </div>
    );
  };

export default VideoCall;