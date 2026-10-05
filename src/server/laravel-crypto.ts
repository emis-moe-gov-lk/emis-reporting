import "server-only";
import { createDecipheriv, createHmac, timingSafeEqual } from "node:crypto";

/** Decrypt a Laravel Encrypter payload without exposing the key to clients. */
export function decryptLaravel(value: string | null | undefined): string | null {
  if (!value) return null;
  const appKey = process.env.APP_KEY ?? process.env.NEMIS_APP_KEY;
  const cipher = (process.env.APP_CIPHER ?? process.env.NEMIS_APP_CIPHER ?? "AES-256-CBC").toLowerCase();
  if (!appKey || cipher !== "aes-256-cbc") return null;

  try {
    const keyText = appKey.startsWith("base64:") ? appKey.slice(7) : appKey;
    const key = Buffer.from(keyText, "base64");
    if (key.length !== 32) return null;
    const payload = JSON.parse(Buffer.from(value, "base64").toString("utf8")) as {
      iv?: string; value?: string; mac?: string;
    };
    if (!payload.iv || !payload.value || !payload.mac) return null;
    const expected = Buffer.from(createHmac("sha256", key).update(payload.iv + payload.value).digest("hex"));
    const actual = Buffer.from(payload.mac);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const decipher = createDecipheriv("aes-256-cbc", key, Buffer.from(payload.iv, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(payload.value, "base64")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
