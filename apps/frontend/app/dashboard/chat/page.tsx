"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/trpc/react";
import { useWebSocket } from "@/hooks/useWebSocket";

interface ChatMessage {
  id: string;
  roomId: string;
  senderType: "visitor" | "bot" | "agent";
  senderName: string | null;
  content: string;
  createdAt: string | Date;
}

interface OrchestrationFields {
  name: string | null;
  email: string | null;
  phone: string | null;
  timezone: string | null;
  reason: string | null;
  language: string | null;
}

interface OrchestrationData {
  state: string;
  fallbackMode: string | null;
  collectedFields: OrchestrationFields;
}

interface ChatRoom {
  id: string;
  status: "bot_active" | "waiting_for_agent" | "agent_joined" | "closed";
  visitorId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  visitorIp: string | null;
  metadata: { orchestration?: OrchestrationData } | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  messages: ChatMessage[];
  _count: { messages: number };
}

function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AgentDashboard() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeRooms = api.chat.getActiveRooms.useQuery(
    {},
    { refetchInterval: 10000, retry: false }
  );
  const getMessages = api.chat.getMessages.useQuery(
    { roomId: selectedRoomId || "" },
    { enabled: !!selectedRoomId }
  );
  const joinRoom = api.chat.joinRoom.useMutation();
  const sendMessage = api.chat.sendMessage.useMutation();
  const closeRoom = api.chat.closeRoom.useMutation();

  // Update rooms list — sort waiting_for_agent first (highest priority)
  useEffect(() => {
    if (activeRooms.data) {
      const statusPriority: Record<string, number> = {
        waiting_for_agent: 0,
        bot_active: 1,
        agent_joined: 2,
      };
      const sorted = [...(activeRooms.data as unknown as ChatRoom[])].sort(
        (a, b) => (statusPriority[a.status] ?? 3) - (statusPriority[b.status] ?? 3)
      );
      setRooms(sorted);
    }
  }, [activeRooms.data]);

  // Load messages for selected room
  useEffect(() => {
    if (getMessages.data) {
      setMessages(getMessages.data as ChatMessage[]);
    }
  }, [getMessages.data]);

  // Track selectedRoomId in a ref to avoid stale closures in WS handler
  const selectedRoomIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedRoomIdRef.current = selectedRoomId;
  }, [selectedRoomId]);

  // WebSocket handler
  const handleWsMessage = useCallback(
    (msg: { type: string; roomId?: string; data?: Record<string, unknown> }) => {
      if (msg.type === "message.new" && msg.data?.message) {
        const newMsg = msg.data.message as ChatMessage;
        if (newMsg.roomId === selectedRoomIdRef.current) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      }

      if (
        msg.type === "room.created" ||
        msg.type === "room.statusChange" ||
        msg.type === "handoff.reminder" ||
        msg.type === "handoff.timeout" ||
        msg.type === "handoff.cancelled" ||
        msg.type === "booking.created" ||
        msg.type === "whatsapp.link_sent"
      ) {
        activeRooms.refetch();
      }
    },
    [activeRooms]
  );

  const { connect, send, status: wsStatus } = useWebSocket(handleWsMessage);

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (wsStatus === "connected") {
      send({
        type: "subscribe.agent",
        roomId: selectedRoomId || undefined,
      });
    }
  }, [wsStatus, selectedRoomId, send]);

  useEffect(() => {
    if (wsStatus === "connected" && selectedRoomId) {
      send({
        type: "subscribe.agent",
        roomId: selectedRoomId,
      });
    }
  }, [selectedRoomId, wsStatus, send]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when room changes
  useEffect(() => {
    if (selectedRoomId) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selectedRoomId]);

  const handleJoinRoom = async (roomId: string) => {
    try {
      await joinRoom.mutateAsync({ roomId });
      activeRooms.refetch();
    } catch (error) {
      console.error("[AgentDashboard] Failed to join room:", error);
    }
  };

  const handleCloseRoom = async (roomId: string) => {
    try {
      await closeRoom.mutateAsync({ roomId });
      if (selectedRoomId === roomId) {
        setSelectedRoomId(null);
        setMessages([]);
      }
      activeRooms.refetch();
    } catch (error) {
      console.error("[AgentDashboard] Failed to close room:", error);
    }
  };

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || !selectedRoomId) return;

    setInputValue("");

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      roomId: selectedRoomId,
      senderType: "agent",
      senderName: "Agent",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const result = await sendMessage.mutateAsync({
        roomId: selectedRoomId,
        content,
        senderType: "agent",
        senderName: "Agent",
      });

      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? (result as ChatMessage) : m))
      );
    } catch (error) {
      console.error("[AgentDashboard] Failed to send message:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  const handleBack = () => {
    setSelectedRoomId(null);
    setMessages([]);
  };

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  // Auth error
  const authError = activeRooms.error?.data?.code === "UNAUTHORIZED" || activeRooms.error?.data?.code === "FORBIDDEN";
  if (authError) {
    return (
      <div className="flex h-[calc(100dvh-64px)] items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <p className="text-sm text-zinc-400 mb-4">Admin access required</p>
          <a href="/api/auth/signin" className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-700">
            Sign in
          </a>
        </div>
      </div>
    );
  }

  const statusBadge = (status: ChatRoom["status"]) => {
    const map = {
      waiting_for_agent: { label: "Waiting", cls: "bg-amber-500/15 text-amber-400 ring-amber-500/20 animate-pulse" },
      bot_active: { label: "Bot", cls: "bg-blue-500/15 text-blue-400 ring-blue-500/20" },
      agent_joined: { label: "Live", cls: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/20" },
      closed: { label: "Closed", cls: "bg-zinc-500/15 text-zinc-500 ring-zinc-500/20" },
    };
    const { label, cls } = map[status];
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${cls}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="flex h-[calc(100dvh-64px)] bg-zinc-950 text-white">
      {/* ── Sidebar — Room List ─────────────────────────────────────── */}
      <div
        className={`flex flex-col border-r border-white/[0.06] bg-zinc-950 ${
          selectedRoomId ? "hidden md:flex" : "flex"
        } w-full md:w-72 lg:w-80`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Chats</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-zinc-500">
                {rooms.length} active
              </span>
              <span className={`inline-flex h-1.5 w-1.5 rounded-full ${wsStatus === "connected" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
            </div>
          </div>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 && (
            <div className="px-4 py-12 text-center">
              <p className="text-xs text-zinc-600">No active conversations</p>
            </div>
          )}

          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => handleSelectRoom(room.id)}
              className={`w-full border-b border-white/[0.04] px-4 py-2.5 text-left transition-colors ${
                selectedRoomId === room.id
                  ? "bg-white/[0.04]"
                  : "hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium text-zinc-200 truncate">
                  {room.visitorName || "Guest User"}
                </span>
                {statusBadge(room.status)}
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-[11px] text-zinc-600 truncate">
                  {room.messages[0]?.content || "No messages"}
                </span>
                <span className="text-[10px] text-zinc-700 shrink-0">
                  {room._count.messages}
                </span>
              </div>
              {room.visitorEmail && (
                <p className="mt-0.5 text-[10px] text-zinc-700 truncate">
                  {room.visitorEmail}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main — Chat View ───────────────────────────────────────── */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${
          selectedRoomId ? "flex" : "hidden md:flex"
        }`}
      >
        {!selectedRoomId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-zinc-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="mx-auto h-10 w-10 mb-2 opacity-40"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                />
              </svg>
              <p className="text-xs">Select a conversation</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Room Header ────────────────────────────────────────── */}
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2 sm:px-4 sm:py-2.5">
              {/* Back button (mobile only) */}
              <button
                onClick={handleBack}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/[0.05] hover:text-white md:hidden"
                aria-label="Back to rooms"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                </svg>
              </button>

              <div className="min-w-0 flex-1">
                <h2 className="text-[13px] font-semibold text-zinc-200 truncate">
                  {selectedRoom?.visitorName || "Guest User"}
                </h2>
                <p className="text-[11px] text-zinc-600 truncate">
                  {selectedRoom?.visitorEmail || "No email"} · {selectedRoom?.status?.replace("_", " ")}
                  {selectedRoom?.visitorIp && (
                    <span className="ml-1 text-zinc-700">· IP {selectedRoom.visitorIp}</span>
                  )}
                  {selectedRoom?.metadata?.orchestration && (
                    <span className="ml-1 text-cyan-600">
                      · {selectedRoom.metadata.orchestration.state.replace(/_/g, " ").toLowerCase()}
                      {selectedRoom.metadata.orchestration.fallbackMode && (
                        <span> ({selectedRoom.metadata.orchestration.fallbackMode})</span>
                      )}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {(selectedRoom?.status === "bot_active" || selectedRoom?.status === "waiting_for_agent") && (
                  <button
                    onClick={() => handleJoinRoom(selectedRoomId)}
                    disabled={joinRoom.isPending}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-medium text-white disabled:opacity-50 ${
                      selectedRoom?.status === "waiting_for_agent"
                        ? "bg-amber-600 hover:bg-amber-500"
                        : "bg-blue-600 hover:bg-blue-500"
                    }`}
                  >
                    {joinRoom.isPending ? "..." : "Join"}
                  </button>
                )}
                {selectedRoom?.status !== "closed" && (
                  <button
                    onClick={() => handleCloseRoom(selectedRoomId)}
                    disabled={closeRoom.isPending}
                    className="rounded-lg bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-300 disabled:opacity-50"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>

            {/* ── Collected Fields (from orchestration) ────────────── */}
            {selectedRoom?.metadata?.orchestration?.collectedFields && (() => {
              const fields = selectedRoom.metadata.orchestration!.collectedFields;
              const hasFields = fields.name || fields.email || fields.phone || fields.reason;
              if (!hasFields) return null;
              return (
                <div className="border-b border-white/[0.04] bg-white/[0.02] px-3 py-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[10px]">
                  {fields.name && <span className="text-zinc-500">Name: <span className="text-zinc-300">{fields.name}</span></span>}
                  {fields.email && <span className="text-zinc-500">Email: <span className="text-zinc-300">{fields.email}</span></span>}
                  {fields.phone && <span className="text-zinc-500">Phone: <span className="text-zinc-300">{fields.phone}</span></span>}
                  {fields.timezone && <span className="text-zinc-500">TZ: <span className="text-zinc-300">{fields.timezone}</span></span>}
                  {fields.reason && <span className="text-zinc-500 truncate max-w-[200px]">Reason: <span className="text-zinc-300">{fields.reason}</span></span>}
                </div>
              );
            })()}

            {/* ── Messages ───────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 space-y-2">
              {messages.map((msg) => {
                const isAgent = msg.senderType === "agent";
                const isVisitor = msg.senderType === "visitor";

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-1.5 ${isAgent ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    {isVisitor ? (
                      <span className="inline-flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/5">
                        <svg fill="currentColor" viewBox="0 0 24 24" className="size-full text-zinc-600">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </span>
                    ) : msg.senderType === "bot" ? (
                      <img
                        src="https://assets.alpadev.xyz/assets/logo.jpg"
                        alt="Bot"
                        className="size-6 shrink-0 rounded-full object-cover ring-1 ring-white/5"
                      />
                    ) : (
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                        A
                      </span>
                    )}

                    {/* Bubble */}
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-1.5 text-[13px] leading-relaxed ${
                        isAgent
                          ? "bg-blue-600 text-white rounded-br-md"
                          : isVisitor
                            ? "bg-white/[0.07] text-zinc-200 rounded-bl-md"
                            : "bg-zinc-800/80 text-zinc-300 rounded-bl-md"
                      }`}
                    >
                      <p className="text-[9px] font-medium opacity-50 mb-0.5">
                        {isVisitor
                          ? selectedRoom?.visitorName || "Guest"
                          : msg.senderName || msg.senderType}
                      </p>
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className="mt-0.5 text-[9px] opacity-30 text-right">
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Status Banners ──────────────────────────────────────── */}
            {selectedRoom?.status === "waiting_for_agent" && (
              <div className="border-t border-amber-500/10 bg-amber-500/[0.06] px-3 py-2 text-center text-[11px] font-medium text-amber-400/80">
                Visitor is waiting — click "Join" to connect
              </div>
            )}
            {selectedRoom?.status === "bot_active" && (
              <div className="border-t border-white/[0.04] bg-white/[0.02] px-3 py-2 text-center text-[11px] text-zinc-600">
                Join to start messaging the visitor
              </div>
            )}
            {selectedRoom?.status === "closed" && (
              <div className="border-t border-white/[0.04] bg-white/[0.02] px-3 py-2 text-center text-[11px] text-zinc-600">
                Conversation closed
              </div>
            )}

            {/* ── Input ──────────────────────────────────────────────── */}
            {selectedRoom?.status === "agent_joined" && (
              <div className="border-t border-white/[0.06] px-3 py-2 sm:px-4">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 rounded-xl border-0 bg-white/[0.06] px-3.5 py-2 text-[13px] text-white placeholder:text-zinc-600 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                    maxLength={2000}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || sendMessage.isPending}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-500 active:scale-95 disabled:bg-white/[0.06] disabled:text-zinc-600"
                    aria-label="Send message"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
