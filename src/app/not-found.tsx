"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Ghost } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="animate-fade-in-up">
        <Ghost className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-4xl font-bold mb-2">페이지를 찾을 수 없어요</h1>
        <p className="text-muted-foreground mb-6">
          요청하신 페이지가 존재하지 않거나, 이동되었을 수 있어요.
        </p>
        <Button onClick={() => router.push("/")} className="text-base">
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  );
}
