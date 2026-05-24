import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import { chatWithAi } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Sparkles } from "lucide-react";
import i18n from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ai-chat")({ component: AiChat });

type Msg = { role: "user" | "assistant"; content: string };

function AiChat() {
  const { t } = useTranslation();
  const chat = useServerFn(chatWithAi);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next); setInput(""); setLoading(true);
    try {
        const normalized = i18n.language?.split("-")[0] as string | undefined;
      const lang = normalized === "mr" ? "mr" : normalized === "hi" ? "hi" : "en";
      const res = await chat({ data: { messages: next, language: lang } });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch (e: any) {
      toast.error(e.message || "AI request failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold">{t("chat.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("chat.subtitle")}</p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border bg-card p-4">
        {messages.length === 0 && (
          <div className="grid h-full place-items-center text-center text-muted-foreground">
            <div>
              <Sparkles className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-3 text-sm">{t("chat.empty")}</p>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <Card className={`max-w-[85%] whitespace-pre-wrap p-3 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : ""}`}>{m.content}</Card>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />{t("chat.thinking")}
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <Textarea
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={t("chat.placeholder")} rows={2} className="resize-none"
        />
        <Button onClick={send} disabled={loading || !input.trim()} className="self-end">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
