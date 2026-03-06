import React from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { io } from "socket.io-client";
import { useAuth } from "../lib/auth";

export function CompanionsPage() {
  const { user } = useAuth();
  const [destination, setDestination] = React.useState("Lisbon");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [results, setResults] = React.useState([]);
  const [chats, setChats] = React.useState([]);
  const [activeChatId, setActiveChatId] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const [body, setBody] = React.useState("");

  const socketRef = React.useRef(null);

  async function refreshChats() {
    try {
      const r = await api.get("/companions/chats");
      setChats(r.data.chats ?? []);
    } catch (err) {
      console.error("Failed to load chats", err);
      setChats([]);
    }
  }

  React.useEffect(() => {
    refreshChats();
  }, []);

  React.useEffect(() => {
    try {
      const socket = io("http://localhost:4000", { withCredentials: true });
      socketRef.current = socket;

      socket.on("chat:message", (msg) => {
        setMessages((prev) => {
          if (msg.chatId !== activeChatId) return prev;
          return [...prev, msg];
        });
      });

      return () => socket.disconnect();
    } catch (err) {
      console.error("Failed to connect to chat socket", err);
      return () => {};
    }
  }, [activeChatId]);

  async function openChat(chatId) {
    setActiveChatId(chatId);
    try {
      const r = await api.get(`/companions/chats/${chatId}/messages`);
      setMessages(r.data.messages ?? []);
    } catch (err) {
      console.error("Failed to load chat messages", err);
      setMessages([]);
    }
    socketRef.current?.emit("chat:join", chatId);
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-2xl font-semibold">Travel Companion Finder</div>
        <div className="text-white/60 text-sm">
          Find travelers going to the same destination/dates and chat in-app.
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Find companions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-3">
                <div className="text-xs text-white/60 mb-1">Destination</div>
                <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Tokyo" />
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Start</div>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">End</div>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="flex items-end">
                <Button
                  className="w-full"
                  onClick={async () => {
                    try {
                      const r = await api.get("/companions/search", {
                        params: { destination, startDate: startDate || undefined, endDate: endDate || undefined },
                      });
                      setResults(r.data.results ?? []);
                    } catch (err) {
                      console.error("Failed to search companions", err);
                      setResults([]);
                    }
                  }}
                >
                  Search
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {results.length === 0 ? (
                <div className="text-sm text-white/60">No results yet. Try another destination.</div>
              ) : (
                results.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-white/10 bg-black/10 p-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold">{p.trip.user.displayName}</div>
                      <div className="text-sm text-white/60">
                        {p.destination} · {String(p.startDate).slice(0, 10)} → {String(p.endDate).slice(0, 10)}
                      </div>
                      <div className="text-sm text-white/70 mt-1">{p.message || "Looking to connect!"}</div>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        try {
                          const r = await api.post("/companions/chats", { otherUserId: p.trip.user.id });
                          await refreshChats();
                          await openChat(r.data.chatId);
                        } catch (err) {
                          console.error("Failed to open chat", err);
                        }
                      }}
                      disabled={p.trip.user.id === user?.id}
                      className="shrink-0"
                    >
                      Chat
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1 space-y-2">
                {chats.length === 0 ? (
                  <div className="text-sm text-white/60">No chats yet.</div>
                ) : (
                  chats.map((c) => {
                    const other = c.members.find((m) => m.userId !== user?.id)?.user;
                    return (
                      <button
                        key={c.id}
                        className={`w-full text-left rounded-xl border px-3 py-2 text-sm ${
                          activeChatId === c.id ? "border-indigo-400/30 bg-indigo-500/10" : "border-white/10 bg-white/[0.03]"
                        }`}
                        onClick={() => openChat(c.id)}
                      >
                        <div className="font-medium">{other?.displayName ?? "Chat"}</div>
                        <div className="text-xs text-white/50 truncate">
                          {c.messages?.[0]?.body ?? "No messages yet"}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="md:col-span-2">
                {!activeChatId ? (
                  <div className="text-sm text-white/60">Select a chat to start messaging.</div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-3 h-[320px] overflow-auto space-y-2">
                      {messages.map((m) => (
                        <div key={m.id} className={`text-sm ${m.userId === user?.id ? "text-right" : ""}`}>
                          <div className="text-xs text-white/50">{m.user?.displayName ?? "User"}</div>
                          <div className="inline-block rounded-2xl px-3 py-2 border border-white/10 bg-white/[0.04] max-w-[85%]">
                            {m.body}
                          </div>
                        </div>
                      ))}
                    </div>

                    <form
                      className="flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const trimmed = body.trim();
                        if (!trimmed) return;
                        socketRef.current?.emit("chat:message", { chatId: activeChatId, body: trimmed });
                        setBody("");
                      }}
                    >
                      <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type a message..." />
                      <Button className="shrink-0">Send</Button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

