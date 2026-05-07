"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PasswordDialog({ onClose }: { onClose: () => void }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ text: "两次密码不一致", ok: false });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: "密码修改成功", ok: true });
        setTimeout(onClose, 1000);
      } else {
        setMessage({ text: data.error || "修改失败", ok: false });
      }
    } catch {
      setMessage({ text: "网络错误", ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className="bg-background border rounded-xl p-6 w-full max-w-sm space-y-4"
      >
        <h3 className="text-lg font-semibold">修改密码</h3>

        <div>
          <label className="text-sm font-medium block mb-1.5">旧密码</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">新密码</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">确认新密码</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-8 rounded-lg border bg-transparent px-2.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            required
          />
        </div>

        {message && (
          <p className={`text-sm ${message.ok ? "text-green-600" : "text-red-500"}`}>
            {message.text}
          </p>
        )}

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "提交中..." : "确认修改"}
          </Button>
        </div>
      </form>
    </div>
  );
}
