import { NextResponse } from "next/server";
import { getCredentials, createToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { username, password } = body;
  const creds = getCredentials();

  if (username !== creds.username || password !== creds.password) {
    return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
  }

  const token = await createToken(username);
  await setAuthCookie(token);

  return NextResponse.json({ success: true });
}
