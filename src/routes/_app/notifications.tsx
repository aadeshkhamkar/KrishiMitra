import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/_app/notifications")({ component: Notifications });

function Notifications() {
  const { t } = useTranslation();
  const q = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-display text-2xl font-bold">{t("sidebar.notifications")}</h1>
      <Card className="divide-y">
        {q.data && q.data.length > 0 ? q.data.map((n) => (
          <div key={n.id} className="flex items-start gap-3 p-4">
            <Bell className="mt-0.5 h-4 w-4 text-primary" />
            <div><div className="font-semibold">{n.title}</div><div className="text-sm text-muted-foreground">{n.body}</div></div>
          </div>
        )) : <div className="p-10 text-center text-muted-foreground">No notifications yet.</div>}
      </Card>
    </div>
  );
}
