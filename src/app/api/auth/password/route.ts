import { NextResponse } from "next/server";
import { getCredentials, updatePassword, verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
  const authHeader = request.headers.get("cookie") || "";
  const tokenMatch = authHeader.match(/auth_token=([^;]+)/);
  if (!tokenMatch || !(await verifyToken(tokenMatch[1]))) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { oldPassword, newPassword } = body;

  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: "请填写完整" }, { status: 400 });
  }

  const creds = getCredentials();
  if (oldPassword !== creds.password) {
    return NextResponse.json({ error: "旧密码错误" }, { status: 401 });
  }

  updatePassword(newPassword);
  return NextResponse.json({ success: true });
}
