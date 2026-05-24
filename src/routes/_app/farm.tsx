import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Tractor } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/farm")({ component: Farm });

type FarmForm = { name: string; size_acres: number; soil_type: string; location: string };

function Farm() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<FarmForm>();

  const farms = useQuery({
    queryKey: ["farms"],
    queryFn: async () => {
      const { data } = await supabase.from("farms").select("*, crops(*)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const onSubmit = async (d: FarmForm) => {
    const { error } = await supabase.from("farms").insert({ ...d, user_id: user!.id });
    if (error) return toast.error(error.message);
    toast.success("Farm added");
    setOpen(false); reset(); qc.invalidateQueries({ queryKey: ["farms"] });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{t("farm.title")}</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />{t("farm.add")}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("farm.add")}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div><Label>{t("farm.name")}</Label><Input {...register("name", { required: true })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t("farm.size")}</Label><Input type="number" step="0.1" {...register("size_acres", { valueAsNumber: true })} /></div>
                <div><Label>{t("farm.soil")}</Label><Input {...register("soil_type")} /></div>
              </div>
              <div><Label>{t("farm.location")}</Label><Input {...register("location")} /></div>
              <Button type="submit" className="w-full">{t("farm.save")}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {farms.data && farms.data.length > 0 ? farms.data.map((f: any) => (
          <Card key={f.id} className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Tractor className="h-5 w-5" /></div>
              <div>
                <div className="font-semibold">{f.name}</div>
                <div className="text-xs text-muted-foreground">{f.location} · {f.size_acres} acres · {f.soil_type}</div>
              </div>
            </div>
            {f.crops?.length > 0 && (
              <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
                <div className="text-xs font-semibold text-muted-foreground">{t("farm.crops")}</div>
                {f.crops.map((c: any) => <div key={c.id}>• {c.name} ({c.crop_type})</div>)}
              </div>
            )}
          </Card>
        )) : <Card className="p-10 text-center text-muted-foreground md:col-span-2">{t("farm.empty")}</Card>}
      </div>
    </div>
  );
}
