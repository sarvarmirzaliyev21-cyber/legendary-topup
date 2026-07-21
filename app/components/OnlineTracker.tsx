"use client";

import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function OnlinePresence() {
  useEffect(() => {
    const channelName = "online-tracker";

    // Инициализируем канал presence
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: Math.random().toString(36).substring(2, 9), // Уникальный ключ для каждой вкладки/устройства
        },
      },
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}