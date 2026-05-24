import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Sprout, Loader2 } from "lucide-react";

export const Route = createFileRoute("/register")({ component: Register });

type Form = { email: string; password: string; full_name: string; mobile: string; location: string; preferred_language: string };

function Register() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({ defaultValues: { preferred_language: "en" } });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (d: Form) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: d.email, password: d.password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name: d.full_name, mobile: d.mobile, location: d.location, preferred_language: d.preferred_language } },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Account created!");
    nav({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-grain p-6">
      <div className="w-full max-w-md space-y-6">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <Sprout className="h-5 w-5" /><span className="font-display font-bold">{t("brand")}</span>
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold">{t("auth.register_title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("auth.register_sub")}</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5"><Label>{t("auth.name")}</Label><Input {...register("full_name", { required: true })} />{errors.full_name && <p className="text-xs text-destructive">required</p>}</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>{t("auth.mobile")}</Label><Input {...register("mobile")} /></div>
            <div className="space-y-1.5"><Label>{t("auth.location")}</Label><Input {...register("location")} /></div>
          </div>
          <div className="space-y-1.5"><Label>{t("auth.email")}</Label><Input type="email" {...register("email", { required: true })} /></div>
          <div className="space-y-1.5"><Label>{t("auth.password")}</Label><Input type="password" {...register("password", { required: true, minLength: 6 })} /></div>
          <div className="space-y-1.5">
            <Label>{t("auth.language")}</Label>
            <Select value={watch("preferred_language")} onValueChange={(v) => setValue("preferred_language", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="mr">मराठी</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.submit_register")}
          </Button>
        </form>
        <div className="text-center text-sm">
          <Link to="/login" className="text-primary hover:underline">{t("auth.switch_to_login")}</Link>
        </div>
      </div>
    </div>
  );
}
