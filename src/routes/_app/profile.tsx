import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile")({ component: Profile });

function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { register, handleSubmit, reset } = useForm<{ full_name: string; mobile: string; location: string }>();

  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      return data;
    },
  });

  useEffect(() => { if (profile.data) reset(profile.data as any); }, [profile.data, reset]);

  const save = async (d: any) => {
    const { error } = await supabase.from("profiles").update(d).eq("id", user!.id);
    if (error) return toast.error(error.message);
    toast.success("Profile updated"); qc.invalidateQueries({ queryKey: ["profile"] });
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="font-display text-2xl font-bold">{t("sidebar.profile")}</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit(save)} className="space-y-4">
          <div><Label>{t("auth.email")}</Label><Input value={user?.email ?? ""} disabled /></div>
          <div><Label>{t("auth.name")}</Label><Input {...register("full_name")} /></div>
          <div><Label>{t("auth.mobile")}</Label><Input {...register("mobile")} /></div>
          <div><Label>{t("auth.location")}</Label><Input {...register("location")} /></div>
          <Button type="submit" className="w-full">{t("common.save")}</Button>
        </form>
      </Card>
    </div>
  );
}
