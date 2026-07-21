import crypto from "crypto";

export const COOKIE_NAME = "admin_pin_ok";
const TTL_MS = 12 * 60 * 60 * 1000; // 12 часов

function sign(payload: string) {
  const secret = process.env.ADMIN_PIN_SECRET!;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function createPinCookieValue() {
  const expires = Date.now() + TTL_MS;
  const payload = `${expires}`;
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function isPinCookieValid(value: string | undefined) {
  if (!value) return false;
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return false;
  if (sign(payload) !== sig) return false;
  const expires = Number(payload);
  if (Number.isNaN(expires) || Date.now() > expires) return false;
  return true;
}