"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { useAuth } from "../context/AuthContext";

type Message = {
  id: string;
  session_id: string;
  sender: string;
  message: string;
  created_at: string;
};

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("support_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("support_session_id", id);
  }
  return id;
}

function newSessionId() {
  const id = crypto.randomUUID();
  localStorage.setItem("support_session_id", id);
  return id;
}

function formatTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ORIGINAL_TITLE = typeof document !== "undefined" ? document.title : "";

export default function SupportWidget() {
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();

  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [unread, setUnread] = useState(0);
  const [adminOnline, setAdminOnline] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // --- НИКНЕЙМ ---
  const [nickname, setNickname] = useState<string | null>(null);
  const [nicknameInput, setNicknameInput] = useState("");
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [claimingNickname, setClaimingNickname] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const roomChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const openRef = useRef(open);

  const quickTags = ["⚡ Как купить?", "🔑 Где заказ?", "🎁 Есть скидки?"];

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    setSessionId(getSessionId());
    setNickname(localStorage.getItem("support_nickname"));
  }, []);

  // Автосинхронизация email — если юзер залогинился (сейчас или позже),
  // подтягиваем его email в текущую сессию поддержки
  useEffect(() => {
    if (!sessionId || !user?.email) return;

    supabase
      .from("support_sessions")
      .update({ email: user.email })
      .eq("session_id", sessionId)
      .then(() => {});
  }, [sessionId, user?.email]);

  // Онлайн-статус админа
  useEffect(() => {
    const presenceChannel = supabase.channel("admin_presence");
    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        setAdminOnline(Object.keys(state).length > 0);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, []);

  // Подписка на сообщения Supabase — только если юзер залогинен
  useEffect(() => {
    if (!sessionId || !user) return;

    async function loadMessages() {
      const { data } = await supabase
        .from("support_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as Message[]);
    }

    loadMessages();

    const channel = supabase
      .channel("support_room", {
        config: { broadcast: { self: false } },
      })
      .on("broadcast", { event: "message" }, ({ payload }) => {
        const incoming = payload as Message;
        if (incoming.session_id !== sessionId) return;

        setMessages((prev) =>
          prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
        );

        if (incoming.sender === "admin") {
          setAdminTyping(false);
          if (!openRef.current || document.hidden) {
            setUnread((prev) => prev + 1);
            try {
              new Audio(
                "data:audio/wav;base64,UklGRhwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
              ).play();
            } catch {}
          }
        }
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.session_id !== sessionId) return;
        if (payload.sender !== "admin") return;
        setAdminTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setAdminTyping(false), 2500);
      })
      .subscribe();

    roomChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, user]);

  useEffect(() => {
    if (unread > 0 && document.hidden) {
      let showAlert = true;
      titleIntervalRef.current = setInterval(() => {
        document.title = showAlert ? "💬 Новое сообщение!" : ORIGINAL_TITLE;
        showAlert = !showAlert;
      }, 1200);
    } else {
      if (titleIntervalRef.current) clearInterval(titleIntervalRef.current);
      document.title = ORIGINAL_TITLE;
    }
    return () => {
      if (titleIntervalRef.current) clearInterval(titleIntervalRef.current);
    };
  }, [unread]);

  useEffect(() => {
    function handleVisibility() {
      if (!document.hidden && open) setUnread(0);
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, adminTyping]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  function handleTextChange(value: string) {
    setText(value);
    roomChannelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { sender: "user", session_id: sessionId },
    });
  }

  async function sendMessageText(messageToSend: string) {
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      session_id: sessionId,
      sender: "user",
      message: messageToSend,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    const { data, error } = await supabase
      .from("support_messages")
      .insert({ session_id: sessionId, sender: "user", message: messageToSend })
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

    await supabase
      .from("support_sessions")
      .upsert({ session_id: sessionId, status: "open", updated_at: new Date().toISOString() });

    roomChannelRef.current?.send({
      type: "broadcast",
      event: "session_status",
      payload: { session_id: sessionId, status: "open" },
    });
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    await sendMessageText(trimmed);
  }

  async function handleStartNewChat() {
    const oldSessionId = sessionId;
    const savedNickname = localStorage.getItem("support_nickname");

    // освобождаем ник у старой сессии, чтобы не конфликтовал с новой
    if (oldSessionId) {
      await supabase
        .from("support_sessions")
        .update({ nickname: null })
        .eq("session_id", oldSessionId);
    }

    const id = newSessionId();
    setMessages([]);
    setSessionId(id);
    setConfirmReset(false);

    if (savedNickname) {
      await supabase.from("support_sessions").upsert(
        {
          session_id: id,
          nickname: savedNickname,
          email: user?.email ?? null,
          status: "open",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "session_id" }
      );
    }
  }

  // --- ПРОВЕРКА И ЗАХВАТ НИКНЕЙМА ---
  async function handleNicknameSubmit() {
    const trimmed = nicknameInput.trim();
    if (!trimmed) {
      setNicknameError("Введите имя");
      return;
    }
    if (trimmed.length > 30) {
      setNicknameError("Слишком длинное имя");
      return;
    }

    setClaimingNickname(true);
    setNicknameError(null);

    const { error } = await supabase.from("support_sessions").upsert(
      {
        session_id: sessionId,
        nickname: trimmed,
        email: user?.email ?? null,
        status: "open",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_id" }
    );

    setClaimingNickname(false);

    if (error) {
      if (error.code === "23505") {
        setNicknameError("Этот никнейм уже занят, выберите другой");
      } else {
        setNicknameError("Ошибка, попробуйте ещё раз");
      }
      return;
    }

    localStorage.setItem("support_nickname", trimmed);
    setNickname(trimmed);
  }

  return (
    // pointer-events-none — обёртка больше не перехватывает клики на всей своей площади
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 select-none">

      {/* МИКРО-АНИМАЦИИ ВЫЛЕТА СООБЩЕНИЙ */}
      <style>{`
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-msg-in { animation: msgIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
      `}</style>

      {/* ОКНО ПОДДЕРЖКИ — само возвращает себе клики через pointer-events-auto, когда открыто */}
      <div 
        className={`flex h-[70vh] max-h-[480px] w-[90vw] max-w-[340px] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${open 
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" 
            : "opacity-0 translate-y-8 scale-95 pointer-events-none"
          }`}
      >
        {/* ШАПКА */}
        <div className="flex items-center justify-between bg-gradient-to-r from-violet-600/90 to-fuchsia-600/90 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              {adminOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${adminOnline ? "bg-emerald-400" : "bg-zinc-400"}`} />
            </span>
            <div>
              <p className="font-bold text-white text-sm leading-tight tracking-wide">Поддержка</p>
              <p className="text-[10px] text-zinc-200/80 leading-tight mt-0.5">
                {adminOnline ? "Онлайн — отвечаем сейчас" : "Обычно отвечаем быстро"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3.5">
            {user && (
              <button
                onClick={() => setConfirmReset(true)}
                className="text-white/70 transition-all hover:text-white hover:rotate-180 active:scale-90 text-sm"
              >
                🔄
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 transition-all hover:text-white hover:scale-110 active:scale-90 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ПОДТВЕРЖДЕНИЕ ОЧИСТКИ */}
        {confirmReset && (
          <div className="animate-msg-in flex items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs">
            <span className="text-zinc-400">Очистить историю?</span>
            <div className="flex gap-3 font-medium">
              <button onClick={handleStartNewChat} className="text-violet-400 hover:text-violet-300">Да</button>
              <button onClick={() => setConfirmReset(false)} className="text-zinc-500 hover:text-zinc-300">Отмена</button>
            </div>
          </div>
        )}

        {authLoading ? (
          /* --- ЗАГРУЗКА СТАТУСА АВТОРИЗАЦИИ --- */
          <div className="flex-1 flex items-center justify-center bg-zinc-950/40">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-800 border-t-violet-500" />
          </div>
        ) : !user ? (
          /* --- ТРЕБУЕТСЯ ВХОД --- */
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center bg-zinc-950/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-xl">
              🔒
            </div>
            <p className="text-sm text-zinc-200 font-bold">Нужно войти в аккаунт</p>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-[220px]">
              Чтобы написать в поддержку, сначала войдите или зарегистрируйтесь
            </p>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-2.5 text-xs font-bold text-white transition-all duration-300 hover:shadow-lg hover:shadow-violet-600/20 active:scale-95"
            >
              Войти / Зарегистрироваться
            </Link>
          </div>
        ) : !nickname ? (
          /* --- ЭКРАН ВВОДА ИМЕНИ --- */
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center bg-zinc-950/40">
            <p className="text-sm text-zinc-200 font-bold">Как вас зовут?</p>
            <p className="text-xs text-zinc-500 -mt-1">Оператор увидит это имя вместо ID</p>
            <input
              value={nicknameInput}
              onChange={(e) => {
                setNicknameInput(e.target.value);
                setNicknameError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleNicknameSubmit()}
              placeholder="Например, Максим"
              autoFocus
              className="w-full max-w-[220px] rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white outline-none transition-all duration-300 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 placeholder-zinc-500"
            />
            {nicknameError && (
              <p className="text-[11px] text-red-400 font-bold">{nicknameError}</p>
            )}
            <button
              onClick={handleNicknameSubmit}
              disabled={claimingNickname}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-2.5 text-xs font-bold text-white transition-all duration-300 hover:shadow-lg hover:shadow-violet-600/20 active:scale-95 disabled:opacity-50"
            >
              {claimingNickname ? "Проверяем..." : "Продолжить"}
            </button>
          </div>
        ) : (
          <>
            {/* ЛЕНТА СООБЩЕНИЙ */}
            <div className="flex-1 space-y-3.5 overflow-y-auto p-4 select-text bg-zinc-950/40">
              {messages.length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-4 bg-zinc-900/30 rounded-xl border border-zinc-800/50 px-3">
                  Добро пожаловать, {nickname}! Чем мы можем помочь?
                </p>
              )}

              {messages.map((m) => (
                <div key={m.id} className={`animate-msg-in flex flex-col ${m.sender === "admin" ? "items-start" : "items-end"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm break-words ${m.sender === "admin" ? "bg-zinc-900 text-zinc-100 rounded-tl-sm border border-zinc-800" : "bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-tr-sm shadow-md shadow-violet-950/30"}`}>
                    {m.message}
                  </div>
                  <span className="mt-1 px-1 text-[9px] text-zinc-500">{formatTime(m.created_at)}</span>
                </div>
              ))}

              {adminTyping && (
                <div className="animate-msg-in flex items-center gap-1.5 px-2 py-1.5 bg-zinc-900 rounded-full w-fit border border-zinc-800">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* ГАДЖЕТ БЫСТРЫХ ТЕГОВ */}
            <div className="flex gap-1.5 px-3 py-2 bg-zinc-950/60 overflow-x-auto border-t border-zinc-800 scrollbar-none">
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => sendMessageText(tag.substring(2))}
                  className="whitespace-nowrap rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-[11px] font-medium text-zinc-400 transition-all hover:border-violet-500/50 hover:text-violet-400 active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* ВВОД */}
            <div className="flex gap-2 border-t border-zinc-800 p-3 bg-zinc-950">
              <input
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Напишите сообщение..."
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white outline-none transition-all duration-300 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 placeholder-zinc-500"
              />
              <button
                onClick={handleSend}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2.5 text-xs font-bold text-white transition-all duration-300 hover:shadow-lg hover:shadow-violet-600/20 hover:scale-[1.04] active:scale-95"
              >
                →
              </button>
            </div>
          </>
        )}
      </div>

      {/* КРУГЛАЯ КНОПКА ТРИГГЕРА — pointer-events-auto возвращает ей кликабельность */}
      <button
        onClick={() => setOpen(!open)}
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-[0_10px_35px_rgba(124,58,237,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_15px_40px_rgba(124,58,237,0.5)] active:scale-95 text-xl overflow-hidden group"
      >
        <span className="relative z-10 transition-transform duration-300 group-hover:rotate-12">
          {open ? "✕" : "💬"}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />

        {!open && adminOnline && (
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-zinc-950 bg-emerald-400 shadow-sm" />
        )}
        
        {!open && unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-zinc-950 shadow-md">
            {unread}
          </span>
        )}
      </button>

    </div>
  );
}
