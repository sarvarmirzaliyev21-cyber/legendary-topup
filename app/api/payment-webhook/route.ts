import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ВАЖНО: используем service_role ключ (не anon!), потому что этот вебхук
// должен обходить RLS — он должен видеть и обновлять ЧУЖИЕ заказы (не свои).
// service_role ключ никогда не должен попасть в браузер — только сюда, в серверный route.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  // 1. Проверяем секретный токен — чтобы никто посторонний не мог
  // слать фейковые "оплата пришла" запросы на этот адрес.
  // Принимаем секрет и как HTTP-заголовок, и как query-параметр в URL —
  // потому что некоторые версии MacroDroid отправляют "Параметры запроса"
  // именно как ?x-webhook-secret=... в строке адреса, а не как настоящий header.
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

  // 2. Парсим сумму из текста пуша Uzum Bank.
  // Формат: "10 000 UZS от MIRZALIYEVA NAZOKAT, карта *6346. Доступно: ..."
  const match = text.match(/([\d\s]+)\s*UZS/);
  if (!match) {
    return NextResponse.json({ ok: false, error: "amount not found in text" }, { status: 400 });
  }

  const amount = parseInt(match[1].replace(/\s/g, ""), 10);
  if (Number.isNaN(amount)) {
    return NextResponse.json({ ok: false, error: "failed to parse amount" }, { status: 400 });
  }

  // 3. Ищем заказ с такой уникальной суммой, который ещё ждёт подтверждения.
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
    // Платёж пришёл, но заказ под такую сумму не нашли — ничего страшного,
    // просто отвечаем 200, чтобы MacroDroid не долбил повторными попытками.
    return NextResponse.json({ ok: true, matched: false, amount });
  }

  const order = matchedOrders[0];

  // 4. Обновляем статус заказа на "оплачено".
  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({ status: "оплачено" })
    .eq("id", order.id);

  if (updateError) {
    console.error("Ошибка обновления заказа:", updateError.message);
    return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, matched: true, orderId: order.id, amount });
}
