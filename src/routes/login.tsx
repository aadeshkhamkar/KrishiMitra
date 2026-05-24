import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Sprout, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/login")({ component: Login });

type Form = { email: string; password: string };

const DEMOS = [
  { name: "Ramesh Patil", loc: "Pune", email: "farmerdemo1@krishimitra.com", password: "Farmer@123", lang: "mr" },
  { name: "Suresh Jadhav", loc: "Nashik", email: "farmerdemo2@krishimitra.com", password: "Farmer@456", lang: "mr" },
];

function Login() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { session } = useAuth();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Form>();
  const [loading, setLoading] = useState(false);

  if (session) { nav({ to: "/dashboard" }); }

  const doLogin = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // try signup (for demos)
      const demo = DEMOS.find((d) => d.email === email);
      if (demo) {
        const { error: sErr } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: demo.name, location: demo.loc, preferred_language: demo.lang, mobile: "" } },
        });
        if (sErr) { toast.error(sErr.message); setLoading(false); return; }
        const { error: lErr } = await supabase.auth.signInWithPassword({ email, password });
        if (lErr) { toast.error(lErr.message); setLoading(false); return; }
      } else {
        toast.error(error.message); setLoading(false); return;
      }
    }
    toast.success("Welcome back!");
    nav({ to: "/dashboard" });
  };

  const onSubmit = (d: Form) => doLogin(d.email, d.password);
  const useDemo = (d: typeof DEMOS[0]) => {
    setValue("email", d.email); setValue("password", d.password);
    doLogin(d.email, d.password);
  };

  return (
    <div className="grid min-h-screen bg-grain md:grid-cols-2">
      <div className="hidden flex-col justify-between gradient-hero p-12 text-primary-foreground md:flex">
        <Link to="/" className="flex items-center gap-2">
          <Sprout className="h-6 w-6" />
          <span className="font-display text-xl font-bold">{t("brand")}</span>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight">{t("hero.title")}</h2>
          <p className="mt-4 max-w-md opacity-90">{t("hero.subtitle")}</p>
        </div>
        <p className="text-sm opacity-70">{t("footer.made")}</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-6">
          <div className="md:hidden">
            <Link to="/" className="flex items-center gap-2 text-primary">
              <Sprout className="h-5 w-5" /><span className="font-display font-bold">{t("brand")}</span>
            </Link>
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">{t("auth.login_title")}</h1>
            <p className="mt-1 text-muted-foreground">{t("auth.login_sub")}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" type="email" {...register("email", { required: true })} />
              {errors.email && <p className="text-xs text-destructive">required</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input id="password" type="password" {...register("password", { required: true, minLength: 6 })} />
              {errors.password && <p className="text-xs text-destructive">min 6 chars</p>}
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.submit_login")}
            </Button>
          </form>

          <div className="text-center text-sm">
            <Link to="/register" className="text-primary hover:underline">{t("auth.switch_to_register")}</Link>
          </div>

          <div className="border-t border-border pt-6">
            <p className="text-sm font-semibold">{t("auth.demo_title")}</p>
            <p className="text-xs text-muted-foreground">{t("auth.demo_sub")}</p>
            <div className="mt-3 grid gap-2">
              {DEMOS.map((d) => (
                <Card key={d.email} className="flex items-center justify-between p-3">
                  <div>
                    <div className="text-sm font-semibold">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.loc} · {d.email}</div>
                  </div>
                  <Button size="sm" variant="outline" disabled={loading} onClick={() => useDemo(d)}>
                    {t("auth.use_demo")}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
