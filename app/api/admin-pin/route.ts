import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, createPinCookieValue, isPinCookieValid } from "../../lib/adminPin";

export async function POST(req: NextRequest) {
  const { pin } = await req.json();

  if (!pin || pin !== process.env.ADMIN_PIN) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createPinCookieValue(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  return NextResponse.json({ ok: isPinCookieValid(value) });
}