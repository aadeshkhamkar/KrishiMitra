import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { Sprout, LayoutDashboard, MessageSquare, Camera, Tractor, ListChecks, Bell, Cloud, History, User, Settings, LogOut, Menu, X, Sun, Moon, Monitor } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/_app")({ component: AppLayout });

const NAV = [
  { to: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { to: "/ai-chat", key: "ai", icon: MessageSquare },
  { to: "/crop-analysis", key: "crop", icon: Camera },
  { to: "/farm", key: "farm", icon: Tractor },
  { to: "/tasks", key: "tasks", icon: ListChecks },
  { to: "/notifications", key: "notifications", icon: Bell },
  { to: "/history", key: "history", icon: History },
  { to: "/profile", key: "profile", icon: User },
  { to: "/settings", key: "settings", icon: Settings },
] as const;

function AppLayout() {
  const { session, loading, signOut } = useAuth();
  const { t } = useTranslation();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!loading && !session) nav({ to: "/login" });
  }, [loading, session, nav]);

  if (loading || !session) {
    return <div className="grid min-h-screen place-items-center bg-background"><div className="text-muted-foreground">{t("common.loading")}</div></div>;
  }

  const handleLogout = async () => { await signOut(); nav({ to: "/" }); };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><Sprout className="h-4 w-4" /></div>
            <span className="font-display font-bold">{t("brand")}</span>
          </Link>
          <Button className="md:hidden" onClick={() => setOpen(false)}><X className="h-5 w-5" /></Button>
        </div>
        <nav className="space-y-1 p-3">
          {NAV.map((n) => {
            const active = path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent"}`}>
                <n.icon className="h-4 w-4" /><span>{t(`sidebar.${n.key}`)}</span>
              </Link>
            );
          })}
          <button onClick={handleLogout} className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4" /><span>{t("sidebar.logout")}</span>
          </button>
        </nav>

        <div className="absolute bottom-4 left-3 right-3 space-y-2">
          <div className="flex rounded-lg border border-sidebar-border p-1">
            {[{v:"light",i:Sun},{v:"system",i:Monitor},{v:"dark",i:Moon}].map(({v,i:I}) => (
              <Button key={v} onClick={() => setTheme(v as any)} className={`flex-1 rounded-md py-1.5 ${theme===v?"bg-sidebar-primary text-sidebar-primary-foreground":"text-sidebar-foreground/70"}`}><I className="mx-auto h-3.5 w-3.5"/></Button>
            ))}
          </div>
          <div className="flex rounded-lg border border-sidebar-border p-1 text-xs">
            {["en","mr","hi"].map((l) => (
              <button key={l} onClick={() => i18n.changeLanguage(l)} className={`flex-1 rounded-md py-1.5 ${i18n.language===l?"bg-sidebar-primary text-sidebar-primary-foreground":"text-sidebar-foreground/70"}`}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col md:pl-64">
        <header className="flex h-16 items-center gap-3 border-b border-border bg-card px-4 md:hidden">
          <Button onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></Button>
          <span className="font-display font-bold">{t("brand")}</span>
        </header>
        <main className="flex-1 p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
