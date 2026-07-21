"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

const OWNER_EMAIL = "sarvarmirzaliyev21@gmail.com";

type Message = {
  id: string;
  session_id: string;
  sender: string;
  message: string;
  created_at: string;
};

const QUICK_REPLIES = [
  "Здравствуйте! Чем можем помочь?",
  "Оплата подтверждена ✅ Товар зачислен на аккаунт.",
  "Проверяем ваш платёж, подождите пару минут.",
  "Пришлите, пожалуйста, скриншот чека.",
  "Спасибо за обращение! Если появятся вопросы — пишите.",
];

function formatTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminSupportPage() {
  const supabase = createClient();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionStatus, setSessionStatus] = useState<Record<string, string>>({});
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [seenSessions, setSeenSessions] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [userTyping, setUserTyping] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  const roomChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeSessionRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    activeSessionRef.current = activeSession;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession, messages, userTyping]);

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();
      setIsOwner(data.session?.user.email === OWNER_EMAIL);
      setCheckingAuth(false);
    }
    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsOwner(session?.user.email === OWNER_EMAIL);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (checkingAuth || !isOwner) return;

    const presenceChannel = supabase.channel("admin_presence");
    presenceChannel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await presenceChannel.track({ online_at: new Date().toISOString() });
      }
    });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [checkingAuth, isOwner]);

  useEffect(() => {
    if (checkingAuth || !isOwner) return;
    loadMessages();
    loadSessionStatuses();
  }, [checkingAuth, isOwner]);

  async function loadMessages() {
    const { data } = await supabase
      .from("support_messages")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setMessages(data as Message[]);
  }

  async function loadSessionStatuses() {
    const { data } = await supabase.from("support_sessions").select("*");
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((row: { session_id: string; status: string }) => {
        map[row.session_id] = row.status;
      });
      setSessionStatus(map);
    }
  }

  useEffect(() => {
    if (checkingAuth || !isOwner) return;

    const channel = supabase
      .channel("support_room", {
        config: { broadcast: { self: false } },
      })
      .on("broadcast", { event: "message" }, ({ payload }) => {
        const incoming = payload as Message;

        setMessages((prev) =>
          prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
        );

        if (incoming.sender === "user") {
          if (incoming.session_id !== activeSessionRef.current) {
            setSeenSessions((prev) => {
              const next = new Set(prev);
              next.delete(incoming.session_id);
              return next;
            });
          }
          try {
            new Audio(
              "data:audio/wav;base64,UklGRhwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
            ).play();
          } catch {}
        }
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.sender !== "user") return;
        if (payload.session_id !== activeSessionRef.current) return;
        setUserTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setUserTyping(false), 2500);
      })
      .on("broadcast", { event: "session_status" }, ({ payload }) => {
        setSessionStatus((prev) => ({
          ...prev,
          [payload.session_id]: payload.status,
        }));
      })
      .subscribe();

    roomChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [checkingAuth, isOwner]);

  useEffect(() => {
    setUserTyping(false);
    setShowQuickReplies(false);
  }, [activeSession]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  const allSessions = Array.from(new Set(messages.map((m) => m.session_id))).sort(
    (a, b) => {
      const lastA = messages.filter((m) => m.session_id === a).slice(-1)[0];
      const lastB = messages.filter((m) => m.session_id === b).slice(-1)[0];
      return (
        new Date(lastB?.created_at ?? 0).getTime() -
        new Date(lastA?.created_at ?? 0).getTime()
      );
    }
  );

  function lastMessage(sessionId: string) {
    const msgs = messages.filter((m) => m.session_id === sessionId);
    return msgs[msgs.length - 1];
  }

  function isClosed(sessionId: string) {
    return sessionStatus[sessionId] === "closed";
  }

  function hasUnread(sessionId: string) {
    const last = lastMessage(sessionId);
    return (
      last?.sender === "user" &&
      sessionId !== activeSession &&
      !seenSessions.has(sessionId) &&
      !isClosed(sessionId)
    );
  }

  const visibleSessions = allSessions.filter((s) =>
    showArchived ? isClosed(s) : !isClosed(s)
  );

  const sessions = visibleSessions.filter((sessionId) => {
    if (!search.trim()) return true;
    const last = lastMessage(sessionId);
    const q = search.toLowerCase();
    return (
      sessionId.toLowerCase().includes(q) ||
      last?.message?.toLowerCase().includes(q)
    );
  });

  const totalUnread = allSessions.filter((s) => hasUnread(s)).length;

  const activeMessages = messages.filter((m) => m.session_id === activeSession);

  function openSession(sessionId: string) {
    setActiveSession(sessionId);
    setSeenSessions((prev) => new Set(prev).add(sessionId));
  }

  async function toggleArchive(sessionId: string) {
    const newStatus = isClosed(sessionId) ? "open" : "closed";
    setSessionStatus((prev) => ({ ...prev, [sessionId]: newStatus }));

    await supabase
      .from("support_sessions")
      .upsert({ session_id: sessionId, status: newStatus, updated_at: new Date().toISOString() });

    roomChannelRef.current?.send({
      type: "broadcast",
      event: "session_status",
      payload: { session_id: sessionId, status: newStatus },
    });

    if (newStatus === "closed") setActiveSession(null);
  }

  function handleReplyChange(value: string) {
    setReply(value);
    if (!activeSession) return;
    roomChannelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { sender: "admin", session_id: activeSession },
    });
  }

  function insertQuickReply(templateText: string) {
    setReply(templateText);
    setShowQuickReplies(false);
  }

  async function handleReply() {
    const trimmed = reply.trim();
    if (!trimmed || !activeSession) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      session_id: activeSession,
      sender: "admin",
      message: trimmed,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setReply("");

    const { data, error } = await supabase
      .from("support_messages")
      .insert({ session_id: activeSession, sender: "admin", message: trimmed })
      .select()
      .single();

    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      return;
    }

    const saved = data as Message;
    setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)));

    roomChannelRef.current?.send({
      type: "broadcast",
      event: "message",
      payload: saved,
    });
  }

  if (checkingAuth) {
    return (
      <main className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-800 border-t-violet-500" />
      </main>
    );
  }

  if (!isOwner) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white select-none">
        <div className="text-center space-y-3 max-w-sm px-6 py-8 rounded-2xl border border-zinc-900/50 bg-zinc-900/10 backdrop-blur-md">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-xl">
            🔒
          </div>
          <h1 className="text-base font-bold text-zinc-200">Доступ запрещён</h1>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Эта страница доступна только владельцу сайта.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen bg-zinc-950 text-white selection:bg-violet-500/30 overflow-hidden relative z-10">
      <style>{`
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-msg { animation: msgIn 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Левая колонка со списками диалогов */}
      <div
        className={`w-full shrink-0 flex-col border-r border-zinc-900 bg-zinc-900/10 backdrop-blur-xl md:flex md:w-85 transition-all duration-300 ${
          activeSession ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="border-b border-zinc-900 p-4 space-y-3 bg-zinc-950/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black tracking-tight text-zinc-100">Обращения</h1>
              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 font-medium">
                <span>{sessions.length} активных сессий</span>
                {totalUnread > 0 && !showArchived && (
                  <span className="flex items-center gap-1.5 font-bold text-violet-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(124,58,237,0.6)] animate-pulse" />
                    {totalUnread} инбокс
                  </span>
                )}
              </div>
            </div>

            <Link
              href="/"
              className="group flex h-8 items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 text-xs font-black text-zinc-400 transition-all duration-300 hover:border-violet-500/30 hover:bg-zinc-900 hover:text-white active:scale-95 shadow-sm"
            >
              <span>←</span>
              <span className="max-w-0 overflow-hidden transition-all duration-300 group-hover:max-w-xs font-bold">На сайт</span>
            </Link>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по ID или тексту..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-3.5 py-2.5 text-xs text-zinc-200 outline-none transition-all duration-300 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 placeholder-zinc-700 font-medium"
          />

          <div className="flex gap-1 rounded-xl bg-zinc-950/60 p-1 border border-zinc-900/80 text-xs">
            <button
              onClick={() => setShowArchived(false)}
              className={`flex-1 rounded-lg py-2 text-xs font-black tracking-wide transition-all duration-300 select-none ${
                !showArchived ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-md shadow-violet-950/40" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Активные
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`flex-1 rounded-lg py-2 text-xs font-black tracking-wide transition-all duration-300 select-none ${
                showArchived ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-md shadow-violet-950/40" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Архив ({allSessions.filter(isClosed).length})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
          {sessions.map((sessionId) => {
            const last = lastMessage(sessionId);
            const unread = hasUnread(sessionId);
            const isCurrent = activeSession === sessionId;
            return (
              <button
                key={sessionId}
                onClick={() => openSession(sessionId)}
                className={`flex w-full flex-col gap-2 rounded-2xl border p-3.5 text-left transition-all duration-300 select-none ${
                  isCurrent 
                    ? "border-violet-500/30 bg-violet-600/10 shadow-[0_4px_20px_rgba(124,58,237,0.05)]" 
                    : "border-transparent bg-transparent hover:bg-zinc-900/30"
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className={`font-mono px-2 py-0.5 rounded-md border font-bold text-zinc-400 ${isCurrent ? 'border-violet-500/20 bg-zinc-950/60' : 'border-zinc-800/80 bg-zinc-950/30'}`}>
                    ID: {sessionId.slice(0, 8)}
                  </span>
                  {last && (
                    <span className="text-zinc-500 font-bold tracking-tight">
                      {formatTime(last.created_at)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between gap-3 w-full">
                  <p className={`text-xs truncate flex-1 font-medium ${unread ? "font-black text-white" : "text-zinc-400"}`}>
                    {last?.sender === "admin" ? <span className="text-violet-400 font-bold">Вы: </span> : ""}
                    {last?.message}
                  </p>
                  {unread && (
                    <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-violet-500 shadow-[0_0_10px_rgba(124,58,237,0.6)]" />
                  )}
                </div>
              </button>
            );
          })}

          {sessions.length === 0 && (
            <div className="py-12 px-4 text-xs text-zinc-500 text-center bg-zinc-900/10 rounded-2xl border border-zinc-900/20 m-2">
              {search ? "Ничего не найдено" : showArchived ? "Архив пуст" : "Пока нет обращений"}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-zinc-900/60 bg-zinc-950/30">
          <button 
            onClick={handleLogout}
            className="w-full rounded-xl border border-zinc-800 py-2.5 text-xs font-black text-zinc-500 transition-all duration-300 hover:bg-red-950/20 hover:border-red-500/20 hover:text-red-400 active:scale-[0.99]"
          >
            Выйти из панели
          </button>
        </div>
      </div>

      {/* Правая колонка — активный чат */}
      <div className={`flex-1 flex-col bg-zinc-950/20 relative z-10 ${activeSession ? "flex" : "hidden md:flex"}`}>
        {!activeSession ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center select-none animate-msg">
            <div className="max-w-sm px-6 py-8 rounded-[28px] border border-zinc-900 bg-zinc-900/20 backdrop-blur-md shadow-inner space-y-3.5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-xl shadow-md">
                💬
              </div>
              <h3 className="text-sm font-black text-zinc-300">Диалог не выбран</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                Выберите нужное обращение в списке слева, чтобы открыть чат.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 border-b border-zinc-900 p-4 bg-zinc-950/40 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveSession(null)}
                  className="text-xs font-bold text-zinc-400 border border-zinc-800 bg-zinc-900/40 px-3 py-2 rounded-xl transition-all hover:text-white md:hidden active:scale-95"
                >
                  ← Назад
                </button>
                <span className="font-mono text-xs bg-zinc-950/80 border border-zinc-900 px-3 py-1.5 rounded-xl text-zinc-400 font-bold shadow-inner">
                  Комната: {activeSession}
                </span>
              </div>

              <button
                onClick={() => toggleArchive(activeSession)}
                className={`rounded-xl border px-4 py-2 text-xs font-black transition-all duration-300 active:scale-95 shadow-sm ${
                  isClosed(activeSession) 
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" 
                    : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                {isClosed(activeSession) ? "↩ Активировать" : "✓ Закрыть тикет"}
              </button>
            </div>

            {/* Сообщения чата */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6 bg-zinc-950/10 scrollbar-thin flex flex-col">
              <div className="flex-1" />
              
              {activeMessages.map((m) => {
                const isAdmin = m.sender === "admin";
                return (
                  <div
                    key={m.id}
                    className={`animate-msg flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm break-words border font-medium ${
                        isAdmin
                          ? "bg-gradient-to-r from-violet-600 to-violet-500 border-violet-500/20 text-white rounded-tr-none shadow-md shadow-violet-950/10"
                          : "bg-zinc-900/60 backdrop-blur-sm border-zinc-800/80 text-zinc-200 rounded-tl-none"
                      }`}
                    >
                      {m.message}
                    </div>
                    <span className="mt-1 px-1.5 text-[9px] font-bold text-zinc-600">
                      {formatTime(m.created_at)}
                    </span>
                  </div>
                );
              })}

              {userTyping && (
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium animate-pulse">
                  <span>Пользователь печатает...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Быстрые ответы и строка ввода */}
            <div className="border-t border-zinc-900/80 p-4 bg-zinc-950/60 space-y-3">
              {showQuickReplies && (
                <div className="flex flex-wrap gap-2 p-2 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 animate-msg">
                  {QUICK_REPLIES.map((tmpl) => (
                    <button
                      key={tmpl}
                      onClick={() => insertQuickReply(tmpl)}
                      className="text-xs bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl hover:border-violet-500/50 hover:text-violet-300 text-zinc-300 font-medium transition-all"
                    >
                      {tmpl}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setShowQuickReplies((prev) => !prev)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-3.5 text-xs font-bold text-zinc-400 hover:text-white transition-all"
                  title="Быстрые шаблоны"
                >
                  ⚡
                </button>
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => handleReplyChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReply()}
                  placeholder="Написать ответ..."
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs text-zinc-100 outline-none focus:border-violet-500 font-medium"
                />
                <button
                  onClick={handleReply}
                  disabled={!reply.trim()}
                  className="rounded-xl bg-violet-600 px-5 py-3 text-xs font-black text-white hover:bg-violet-500 transition-all active:scale-95 disabled:opacity-40"
                >
                  Отправить
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}