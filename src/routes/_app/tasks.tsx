import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/tasks")({ component: Tasks });

type Form = { title: string; description: string; due_date: string; priority: string };

function Tasks() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<Form>({ defaultValues: { priority: "medium" } });

  const tasks = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*").order("due_date", { ascending: true });
      return data ?? [];
    },
  });

  const add = async (d: Form) => {
    const { error } = await supabase.from("tasks").insert({ ...d, user_id: user!.id, status: "pending" });
    if (error) return toast.error(error.message);
    toast.success("Task added"); setOpen(false); reset(); qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  const toggle = async (id: string, status: string) => {
    await supabase.from("tasks").update({ status: status === "done" ? "pending" : "done" }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{t("tasks.title")}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />{t("tasks.add")}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("tasks.add")}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(add)} className="space-y-3">
              <div><Label>{t("tasks.task_title")}</Label><Input {...register("title", { required: true })} /></div>
              <div><Label>{t("tasks.description")}</Label><Input {...register("description")} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t("tasks.due")}</Label><Input type="date" {...register("due_date")} /></div>
                <div><Label>{t("tasks.priority")}</Label>
                  <select {...register("priority")} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="low">{t("tasks.low")}</option>
                    <option value="medium">{t("tasks.medium")}</option>
                    <option value="high">{t("tasks.high")}</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full">{t("common.save")}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="divide-y">
        {tasks.data && tasks.data.length > 0 ? tasks.data.map((task) => (
          <button key={task.id} onClick={() => toggle(task.id, task.status)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/50">
            {task.status === "done" ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
            <div className="flex-1">
              <div className={`font-medium ${task.status === "done" ? "text-muted-foreground line-through" : ""}`}>{task.title}</div>
              <div className="text-xs text-muted-foreground">{task.due_date ?? "—"} · {task.priority}</div>
            </div>
          </button>
        )) : <div className="p-10 text-center text-muted-foreground">{t("tasks.empty")}</div>}
      </Card>
    </div>
  );
}
