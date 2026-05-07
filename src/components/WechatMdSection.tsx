"use client";

import { useState } from "react";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";

export function WechatMdSection({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <h2 className="text-lg font-semibold">公众号文章</h2>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="size-3.5" />
              已复制
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              复制 MD
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-muted/50 rounded-lg">
          <MarkdownViewer content={content} />
        </div>
      </CardContent>
    </Card>
  );
}
