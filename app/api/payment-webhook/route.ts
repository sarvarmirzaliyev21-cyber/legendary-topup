import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET;

async function sendTelegramNotification(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("Telegram: не настроены TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID");
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
  } catch (err) {
    console.error("Telegram: ошибка отправки уведомления:", err);
  }
}

export async function POST(req: NextRequest) {
  const providedSecret =
    req.headers.get("x-webhook-secret") ??
    req.nextUrl.searchParams.get("x-webhook-secret");

  if (!WEBHOOK_SECRET || providedSecret !== WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const text: string | undefined = body?.text;

  if (!text) {
    return NextResponse.json({ ok: false, error: "no text provided" }, { status: 400 });
  }

  const match = text.match(/([\d\s]+)\s*UZS/);
  if (!match) {
    return NextResponse.json({ ok: false, error: "amount not found in text" }, { status: 400 });
  }

  const amount = parseInt(match[1].replace(/\s/g, ""), 10);
  if (Number.isNaN(amount)) {
    return NextResponse.json({ ok: false, error: "failed to parse amount" }, { status: 400 });
  }

  const { data: matchedOrders, error: findError } = await supabaseAdmin
    .from("orders")
    .select("id, payment_amount, status")
    .eq("payment_amount", amount)
    .eq("status", "ожидает_подтверждения")
    .order("created_at", { ascending: true })
    .limit(1);

  if (findError) {
    console.error("Ошибка поиска заказа:", findError.message);
    return NextResponse.json({ ok: false, error: findError.message }, { status: 500 });
  }

  if (!matchedOrders || matchedOrders.length === 0) {
    return NextResponse.json({ ok: true, matched: false, amount });
  }

  const order = matchedOrders[0];

  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({ status: "оплачено" })
    .eq("id", order.id);

  if (updateError) {
    console.error("Ошибка обновления заказа:", updateError.message);
    return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
  }

  await sendTelegramNotification(
    `✅ <b>Новый заказ оплачен!</b>\n\n💰 Сумма: ${amount} UZS\n🆔 Order ID: ${order.id}`
  );

  return NextResponse.json({ ok: true, matched: true, orderId: order.id, amount });
}