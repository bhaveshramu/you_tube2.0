import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyrroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import downloadroutes from "./routes/download.js";
import subscriptionroutes from "./routes/subscription.js";
import otproutes from "./routes/otp.js";
import cloudinary from "./config/cloudinary.js";


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", methods: ["GET", "POST"],
  },
});
import path from "path";
app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use("/uploads", express.static(path.join("uploads")));
app.get("/", (req, res) => {
  res.send("You tube backend is working");
});
app.use(bodyParser.json());
app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);
app.use("/download", downloadroutes);
app.use("/subscription", subscriptionroutes);
app.use("/otp", otproutes);
const PORT = process.env.PORT || 5000;

// WATCH PARTY - SOCKET.IO
const watchParties = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // CHAT MESSAGE
  socket.on("party-message", ({ partyId, username, message }) => {
    const party = watchParties.get(partyId);

    if (!party) return;

    io.to(partyId).emit("party-message", {
      socketId: socket.id,
      username,
      message,
      timestamp: Date.now(),
    });
  });

  // CREATE PARTY
  socket.on(
    "create-party",
    ({ partyId, username, videoId }) => {
      watchParties.set(partyId, {
        host: socket.id,
        videoId,
        participants: [
          {
            socketId: socket.id,
            username,
          },
        ],

        videoState: {
          currentTime: 0,
          isPlaying: false,
          updatedAt: Date.now(),
        },
      });

      socket.join(partyId);

      socket.emit("party-created", {
        partyId,
      });

      io.to(partyId).emit("participants-updated", {
        participants: watchParties.get(partyId).participants,
      });

      console.log(
        `${username} created party: ${partyId}`
      );
    }
  );

  // JOIN PARTY
  socket.on(
    "join-party",
    ({ partyId, username, videoId }) => {
      const party = watchParties.get(partyId);

      if (!party) {
        socket.emit("party-error", {
          message: "Watch party not found",
        });
        return;
      }

      // Make sure everyone is watching the same video
      if (party.videoId !== videoId) {
        socket.emit("party-error", {
          message:
            "This watch party is for a different video.",
        });
        return;
      }

      socket.join(partyId);

      party.participants.push({
        socketId: socket.id,
        username,
      });

      io.to(partyId).emit("participants-updated", {
        participants: party.participants,
      });

      // Send current video state to the new participant
      let currentTime =
        party.videoState.currentTime;

      if (party.videoState.isPlaying) {
        const elapsed =
          (Date.now() -
            party.videoState.updatedAt) /
          1000;

        currentTime += elapsed;
      }

      socket.emit("video-state", {
        currentTime,
        isPlaying: party.videoState.isPlaying,
      });

      console.log(
        `${username} joined party: ${partyId}`
      );
    }
  );

  // PLAY
  socket.on(
    "video-play",
    ({ partyId, currentTime }) => {
      const party = watchParties.get(partyId);

      if (!party) return;

      party.videoState = {
        currentTime,
        isPlaying: true,
        updatedAt: Date.now(),
      };

      socket.to(partyId).emit("video-play", {
        currentTime,
      });
    }
  );

  // PAUSE
  socket.on(
    "video-pause",
    ({ partyId, currentTime }) => {
      const party = watchParties.get(partyId);

      if (!party) return;

      party.videoState = {
        currentTime,
        isPlaying: false,
        updatedAt: Date.now(),
      };

      socket.to(partyId).emit("video-pause", {
        currentTime,
      });
    }
  );

  // SEEK
  socket.on(
    "video-seek",
    ({ partyId, currentTime }) => {
      const party = watchParties.get(partyId);

      if (!party) return;

      party.videoState.currentTime =
        currentTime;

      party.videoState.updatedAt =
        Date.now();

      socket.to(partyId).emit("video-seek", {
        currentTime,
      });
    }
  );

  // WEBRTC VIDEO CALL SIGNALING

  // User joins the video call
  socket.on("join-call", ({ partyId, username }) => {
    const party = watchParties.get(partyId);

    if (!party) {
      socket.emit("call-error", {
        message: "Watch party not found.",
      });
      return;
    }

    // Get users already inside the call
    const existingUsers = party.callParticipants || [];

    // Store this user in the call
    if (!party.callParticipants) {
      party.callParticipants = [];
    }
    // Prevent the same socket from joining the call twice
    const alreadyInCall = party.callParticipants.some(
      (participant) =>
        participant.socketId === socket.id
    );
    if (!alreadyInCall) {
      party.callParticipants.push({
        socketId: socket.id,
        username,
      });
    }

    /*party.callParticipants.push({
      socketId: socket.id,
      username,
    });*/

    // Send existing users to the new participant
    socket.emit("call-existing-users", {
      users: existingUsers,
    });

    // Tell existing participants that a new user joined
    socket.to(partyId).emit("call-user-joined", {
      socketId: socket.id,
      username,
    });

    console.log(
      `${username} joined video call in party: ${partyId}`
    );
  });

  // WebRTC offer
  socket.on(
    "webrtc-offer",
    ({ targetSocketId, offer }) => {
      io.to(targetSocketId).emit("webrtc-offer", {
        senderSocketId: socket.id,
        offer,
      });
    }
  );

  // WebRTC answer
  socket.on(
    "webrtc-answer",
    ({ targetSocketId, answer }) => {
      io.to(targetSocketId).emit("webrtc-answer", {
        senderSocketId: socket.id,
        answer,
      });
    }
  );

  // ICE candidate
  socket.on(
    "webrtc-ice-candidate",
    ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit(
        "webrtc-ice-candidate",
        {
          senderSocketId: socket.id,
          candidate,
        }
      );
    }
  );

  // User leaves video call
  socket.on("leave-call", ({ partyId }) => {
    const party = watchParties.get(partyId);

    if (!party) return;

    party.callParticipants =
      (party.callParticipants || []).filter(
        (participant) =>
          participant.socketId !== socket.id
      );

    socket.to(partyId).emit("call-user-left", {
      socketId: socket.id,
    });

    console.log(
      `User ${socket.id} left video call in party: ${partyId}`
    );
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    console.log(
      "Socket disconnected:",
      socket.id
    );

    for (const [partyId, party] of watchParties.entries()) {
      if (party.callParticipants) {
        party.callParticipants =
          party.callParticipants.filter(
            (participant) =>
              participant.socketId !== socket.id
          );
        io.to(partyId).emit("call-user-left", {
          socketId: socket.id,
        });
      }
      party.participants =
        party.participants.filter(
          (participant) =>
            participant.socketId !== socket.id
        );

      if (party.participants.length === 0) {
        watchParties.delete(partyId);
      } else {
        io.to(partyId).emit(
          "participants-updated",
          {
            participants:
              party.participants,
          }
        );
      }
    }
  });
});
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`server running on port ${PORT}`);
});

const DBURL = process.env.DB_URL;
mongoose
  .connect(DBURL)
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch((error) => {
    console.log(error);
  });
