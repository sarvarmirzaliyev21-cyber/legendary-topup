import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PROMO_ID = "global-1rub-promo";

// Проверить, занята ли акция вообще (для любой из 8 игр)
export async function GET() {
  const { data } = await supabaseAdmin
    .from("promo_claims")
    .select("slug")
    .eq("id", PROMO_ID)
    .maybeSingle();

  return NextResponse.json({ ok: true, claimed: !!data, slug: data?.slug ?? null });
}

// Попытаться занять акцию (вызывается при попытке купить один из 8 промо-товаров)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const slug: string | undefined = body?.slug;

  if (!slug) {
    return NextResponse.json({ ok: false, error: "no slug" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("promo_claims")
    .insert({ id: PROMO_ID, slug });

  if (error) {
    if (error.code === "23505") {
      // Уже кто-то занял — неважно, по какой игре
      return NextResponse.json({ ok: false, claimed: true }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, claimed: false });
}