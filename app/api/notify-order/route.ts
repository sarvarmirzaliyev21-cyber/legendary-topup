import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json({ ok: false, error: "telegram not configured" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "invalid body" }, { status: 400 });
  }

  const { game, product, paymentAmount, playerInfo } = body;

  const playerInfoText = playerInfo && Object.keys(playerInfo).length > 0
    ? Object.entries(playerInfo).map(([k, v]) => `${k}: ${v}`).join("\n")
    : "—";

  const text =
    `🛒 <b>Новый заказ!</b>\n\n` +
    `🎮 Игра: ${game}\n` +
    `📦 Товар: ${product}\n` +
    `💰 Сумма: ${paymentAmount} сум\n\n` +
    `👤 Данные игрока:\n${playerInfoText}`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram notify error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}