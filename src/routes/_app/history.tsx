import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/history")({ component: History });

function History() {
  const { t } = useTranslation();
  const chats = useQuery({
    queryKey: ["chat-history"],
    queryFn: async () => {
      const { data } = await supabase.from("chat_history").select("*").order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-display text-2xl font-bold">{t("sidebar.history")}</h1>
      <Card className="divide-y">
        {chats.data && chats.data.length > 0 ? chats.data.map((c) => (
          <div key={c.id} className="p-4">
            <div className="text-xs font-semibold uppercase text-primary">{c.role}</div>
            <div className="mt-1 whitespace-pre-wrap text-sm">{c.content}</div>
            <div className="mt-1 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</div>
          </div>
        )) : <div className="p-10 text-center text-muted-foreground">No history yet.</div>}
      </Card>
    </div>
  );
}
