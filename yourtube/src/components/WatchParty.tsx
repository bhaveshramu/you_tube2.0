"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
    Users,
    Video,
    LogIn,
    LogOut,
    Copy,
    Check,
    MessageCircle,
    Send,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import VideoCall from "@/components/VideoCall";

interface Participant {
    socketId: string;
    username: string;
}
interface ChatMessage {
    socketId: string;
    username: string;
    message: string;
    timestamp: string;
}

interface WatchPartyProps {
    username: string;
    videoId: string;
    onPartyReady: (
        socket: Socket | null,
        partyId: string
    ) => void;
}

const SOCKET_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:5000";

export default function WatchParty({
    username,
    videoId,
    onPartyReady,
}: WatchPartyProps) {
    const [socket, setSocket] =
        useState<Socket | null>(null);

    const [partyId, setPartyId] =
        useState("");

    const [joinPartyId, setJoinPartyId] =
        useState("");

    const [participants, setParticipants] =
        useState<Participant[]>([]);

    const [joinedParty, setJoinedParty] =
        useState(false);

    const [isHost, setIsHost] =
        useState(false);

    const [error, setError] =
        useState("");

    const [copied, setCopied] =
        useState(false);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isExpanded, setIsExpanded] =
        useState(false);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);

        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log(
                "Watch Party Socket connected:",
                newSocket.id
            );
        });

        newSocket.on(
            "party-created",
            ({ partyId }) => {
                setPartyId(partyId);
                setJoinedParty(true);
                setIsHost(true);

                onPartyReady(
                    newSocket,
                    partyId
                );
            }
        );

        newSocket.on(
            "participants-updated",
            ({ participants }) => {
                setParticipants(participants);
            }
        );

        newSocket.on(
            "party-error",
            ({ message }) => {
                setError(message);
            }
        );

        newSocket.on(
            "party-message",
            (message: ChatMessage) => {
                setMessages((previous) => [
                    ...previous,
                    message,
                ]);
            }
        );

        return () => {
            newSocket.disconnect();
            onPartyReady(null, "");
        };
    }, [onPartyReady]);

    const sendMessage = () => {
        if (
            !socket ||
            !partyId ||
            !newMessage.trim()
        ) {
            return;
        }

        socket.emit("party-message", {
            partyId,
            username,
            message: newMessage.trim(),
        });

        setNewMessage("");
    };

    const handleChatKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    const createParty = () => {
        if (!socket) return;

        setError("");
        setIsHost(true);

        const newPartyId =
            Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();

        socket.emit("create-party", {
            partyId: newPartyId,
            username,
            videoId,
        });
    };

    const joinParty = () => {
        if (
            !socket ||
            !joinPartyId.trim()
        ) {
            return;
        }

        setError("");

        const id =
            joinPartyId
                .trim()
                .toUpperCase();

        socket.emit("join-party", {
            partyId: id,
            username,
            videoId,
        });

        setPartyId(id);
        setJoinedParty(true);
        setIsHost(false);

        onPartyReady(socket, id);
    };

    const leaveParty = () => {
        setIsHost(false);
        onPartyReady(null, "");
        window.location.reload();
    };

    const copyPartyId = async () => {
        await navigator.clipboard.writeText(
            partyId
        );

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 1500);
    };

    if (!joinedParty) {
        return (
            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">

                {/* Watch Party Header */}
                <button
                    type="button"
                    onClick={() =>
                        setIsExpanded(
                            (previous) => !previous
                        )
                    }
                    className="flex w-full items-center justify-between p-4 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                    <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
                            <Video
                                className="h-5 w-5 text-red-600"
                            />
                        </div>

                        <div>
                            <h2 className="font-semibold">
                                Watch Party
                            </h2>

                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Watch this video together with your friends
                            </p>
                        </div>

                    </div>

                    {isExpanded ? (
                        <ChevronUp
                            className="h-5 w-5 text-gray-500"
                        />
                    ) : (
                        <ChevronDown
                            className="h-5 w-5 text-gray-500"
                        />
                    )}
                </button>

                {/* Expandable Content */}
                {isExpanded && (
                    <div className="border-t border-gray-200 p-4 dark:border-gray-700">

                        <div className="flex flex-col gap-3 sm:flex-row">

                            <button
                                onClick={createParty}
                                className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                            >
                                <Users className="h-4 w-4" />

                                Create Watch Party
                            </button>

                            <input
                                type="text"
                                placeholder="Enter Party ID"
                                value={joinPartyId}
                                onChange={(e) =>
                                    setJoinPartyId(
                                        e.target.value
                                    )
                                }
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-black outline-none focus:border-red-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            />

                            <button
                                onClick={joinParty}
                                className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
                            >
                                <LogIn className="h-4 w-4" />

                                Join
                            </button>

                        </div>

                        {error && (
                            <p className="mt-3 text-sm text-red-500">
                                {error}
                            </p>
                        )}

                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <div className="flex items-center gap-2">
                        <Video className="h-5 w-5" />

                        <h2 className="text-lg font-semibold">
                            Watch Party
                        </h2>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">

                        <span>
                            Party ID:
                        </span>

                        <span className="font-bold text-black dark:text-white">
                            {partyId}
                        </span>

                        <button
                            onClick={copyPartyId}
                            title="Copy Party ID"
                            className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            {copied ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </button>

                    </div>
                </div>

                <button
                    onClick={leaveParty}
                    className="flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                    <LogOut className="h-4 w-4" />
                    Leave Party
                </button>

            </div>

            <div className="mt-4">

                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />

                    <h3 className="font-medium">
                        Participants ({participants.length})
                    </h3>
                </div>

                {/* Party Chat */}
                <div className="mt-5 border-t border-gray-200 pt-4 dark:border-gray-700">

                    <div className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />

                        <h3 className="font-medium">
                            Party Chat
                        </h3>
                    </div>

                    <div className="mt-3 h-64 overflow-y-auto rounded-lg bg-gray-100 p-3 dark:bg-gray-800">

                        {messages.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                                No messages yet. Start the conversation.
                            </div>
                        ) : (
                            <div className="space-y-3">

                                {messages.map((msg, index) => (
                                    <div
                                        key={`${msg.timestamp}-${msg.socketId}-${index}`}
                                        className={`flex ${msg.socketId === socket?.id
                                            ? "justify-end"
                                            : "justify-start"
                                            }`}
                                    >

                                        <div
                                            className={`max-w-[80%] rounded-xl px-3 py-2 ${msg.socketId === socket?.id
                                                ? "bg-red-600 text-white"
                                                : "bg-white text-black dark:bg-gray-700 dark:text-white"
                                                }`}
                                        >

                                            <div className="text-xs font-semibold opacity-80">
                                                {msg.username}
                                            </div>

                                            <div className="mt-1 break-words text-sm">
                                                {msg.message}
                                            </div>

                                            <div className="mt-1 text-[10px] opacity-60">
                                                {new Date(
                                                    msg.timestamp
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>

                                        </div>

                                    </div>
                                ))}

                            </div>
                        )}

                    </div>

                    <div className="mt-3 flex gap-2">

                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) =>
                                setNewMessage(e.target.value)
                            }
                            onKeyDown={handleChatKeyDown}
                            placeholder="Type a message..."
                            className="min-w-0 flex-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-black outline-none focus:border-red-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />

                        <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
                            title="Send message"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" />
                        </button>

                    </div>

                </div>

                <div className="mt-2 space-y-2">

                    {participants.map(
                        (participant) => (
                            <div
                                key={
                                    participant.socketId
                                }
                                className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 dark:bg-gray-800"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm text-white">
                                    {participant.username
                                        ?.charAt(0)
                                        ?.toUpperCase()}
                                </div>

                                <span>
                                    {participant.username}
                                </span>
                            </div>
                        )
                    )}

                </div>
                <VideoCall
                    socket={socket!}
                    partyId={partyId}
                    username={username}
                    participants={participants}
                    isHost={isHost}
                />
            </div>

            <div className="mt-4 rounded-lg bg-gray-100 p-3 text-sm dark:bg-gray-800">

                <div className="flex items-center justify-between gap-3">

                    <span>
                        Share this Party ID with your friends
                    </span>

                    <button
                        onClick={copyPartyId}
                        className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4" />
                                Copy
                            </>
                        )}
                    </button>

                </div>

                <div className="mt-2 rounded bg-white p-2 font-mono font-bold dark:bg-gray-700">
                    {partyId}
                </div>

            </div>

        </div>
    );
}