import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import {
  Tractor, Sprout, ListChecks, Camera, MessageSquare, ArrowRight,
  TrendingUp, AlertTriangle, CheckCircle2, Activity,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--muted-foreground))"];
const SEVERITY_COLORS: Record<string, string> = {
  high: "hsl(0 72% 51%)",
  moderate: "hsl(38 92% 50%)",
  low: "hsl(142 71% 45%)",
  unknown: "hsl(var(--muted-foreground))",
};

function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const stats = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [farms, crops, tasks, reports, profile] = await Promise.all([
        supabase.from("farms").select("id", { count: "exact", head: true }),
        supabase.from("crops").select("id", { count: "exact", head: true }),
        supabase.from("tasks").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("disease_reports").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("full_name").eq("id", user!.id).single(),
      ]);
      return {
        farms: farms.count ?? 0,
        crops: crops.count ?? 0,
        tasks: tasks.count ?? 0,
        reports: reports.count ?? 0,
        name: profile.data?.full_name || user!.email?.split("@")[0] || "Farmer",
      };
    },
  });

  const analytics = useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: async () => {
      const [tasksRes, reportsRes, cropsRes] = await Promise.all([
        supabase.from("tasks").select("status,priority,created_at,due_date"),
        supabase.from("disease_reports").select("severity,disease_name,created_at"),
        supabase.from("crops").select("crop_type,name,created_at"),
      ]);
      return {
        tasks: tasksRes.data ?? [],
        reports: reportsRes.data ?? [],
        crops: cropsRes.data ?? [],
      };
    },
  });

  const tasksQ = useQuery({
    queryKey: ["upcoming-tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*").eq("status", "pending").order("due_date", { ascending: true }).limit(5);
      return data ?? [];
    },
  });

  // Derived analytics
  const tasks = analytics.data?.tasks ?? [];
  const reports = analytics.data?.reports ?? [];
  const crops = analytics.data?.crops ?? [];

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const completion = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const statusData = [
    { name: t("tasks.pending"), value: tasks.filter((x) => x.status === "pending").length },
    { name: t("tasks.in_progress"), value: tasks.filter((x) => x.status === "in_progress").length },
    { name: t("tasks.done"), value: doneTasks },
  ].filter((d) => d.value > 0);

  const priorityData = [
    { name: t("tasks.high"), value: tasks.filter((x) => x.priority === "high").length },
    { name: t("tasks.medium"), value: tasks.filter((x) => x.priority === "medium").length },
    { name: t("tasks.low"), value: tasks.filter((x) => x.priority === "low").length },
  ];

  // 14-day activity
  const days = Array.from({ length: 14 }, (_, i) => startOfDay(subDays(new Date(), 13 - i)));
  const activityData = days.map((d) => {
    const key = format(d, "MMM dd");
    const dayMs = d.getTime();
    const next = dayMs + 86400000;
    return {
      date: key,
      reports: reports.filter((r) => {
        const t = new Date(r.created_at).getTime();
        return t >= dayMs && t < next;
      }).length,
      tasks: tasks.filter((tk) => {
        const t = new Date(tk.created_at).getTime();
        return t >= dayMs && t < next;
      }).length,
    };
  });

  // Severity breakdown
  const severityCounts: Record<string, number> = {};
  reports.forEach((r) => {
    const k = (r.severity || "unknown").toLowerCase();
    severityCounts[k] = (severityCounts[k] || 0) + 1;
  });
  const severityData = Object.entries(severityCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    fill: SEVERITY_COLORS[name] || SEVERITY_COLORS.unknown,
  }));

  // Top diseases
  const diseaseCounts: Record<string, number> = {};
  reports.forEach((r) => {
    if (r.disease_name) diseaseCounts[r.disease_name] = (diseaseCounts[r.disease_name] || 0) + 1;
  });
  const topDiseases = Object.entries(diseaseCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([name, value]) => ({ name: name.length > 22 ? name.slice(0, 20) + "…" : name, value }));

  // Crop type distribution
  const cropTypeCounts: Record<string, number> = {};
  crops.forEach((c) => {
    const k = c.crop_type || "Other";
    cropTypeCounts[k] = (cropTypeCounts[k] || 0) + 1;
  });
  const cropTypeData = Object.entries(cropTypeCounts).map(([name, value]) => ({ name, value }));

  const completionData = [{ name: "Done", value: completion, fill: "hsl(var(--primary))" }];

  const cards = [
    { k: "farms", icon: Tractor, v: stats.data?.farms ?? 0, hint: "+ farms" },
    { k: "crops", icon: Sprout, v: stats.data?.crops ?? 0, hint: "active" },
    { k: "tasks_due", icon: ListChecks, v: stats.data?.tasks ?? 0, hint: "pending" },
    { k: "reports", icon: Camera, v: stats.data?.reports ?? 0, hint: "total scans" },
  ];

  const tooltipStyle = {
    contentStyle: {
      background: "hsl(var(--card))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "0.75rem",
      fontSize: "0.8rem",
    },
    labelStyle: { color: "hsl(var(--foreground))" },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">{t("dashboard.welcome", { name: stats.data?.name ?? "" })}</h1>
        <p className="mt-1 text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.k} className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{t(`dashboard.${c.k}`)}</div>
              <c.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-3 font-display text-3xl font-bold">{c.v}</div>
            <div className="mt-1 text-xs text-muted-foreground">{c.hint}</div>
          </Card>
        ))}
      </div>

      {/* Charts row 1: Activity + Completion */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold">Activity — last 14 days</h3>
              <p className="text-xs text-muted-foreground">Tasks created vs disease scans</p>
            </div>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={activityData} margin={{ left: -20, right: 6, top: 6, bottom: 0 }}>
              <defs>
                <linearGradient id="gTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="tasks" stroke="hsl(var(--primary))" fill="url(#gTasks)" strokeWidth={2} />
              <Area type="monotone" dataKey="reports" stroke="hsl(var(--accent))" fill="url(#gReports)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="flex flex-col p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-display font-semibold">Task completion</h3>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <div className="relative flex-1">
            <ResponsiveContainer width="100%" height={220}>
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={completionData} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={12} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="font-display text-4xl font-bold">{completion}%</div>
                <div className="text-xs text-muted-foreground">{doneTasks} of {totalTasks}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts row 2: Status + Priority + Severity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display font-semibold">Tasks by status</h3>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart label="No task data yet" />}
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display font-semibold">Tasks by priority</h3>
            <ListChecks className="h-4 w-4 text-primary" />
          </div>
          {priorityData.some((p) => p.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priorityData} margin={{ left: -20, right: 6, top: 6, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip {...tooltipStyle} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {priorityData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart label="No task data yet" />}
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display font-semibold">Disease severity</h3>
            <AlertTriangle className="h-4 w-4 text-primary" />
          </div>
          {severityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={severityData} dataKey="value" nameKey="name" outerRadius={85} label={{ fontSize: 11 }}>
                  {severityData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart label="No scans yet" />}
        </Card>
      </div>

      {/* Charts row 3: Top diseases + Crop mix */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 font-display font-semibold">Top reported diseases</h3>
          {topDiseases.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topDiseases} layout="vertical" margin={{ left: 10, right: 20, top: 6, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart label="No disease reports yet" />}
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 font-display font-semibold">Crop mix</h3>
          {cropTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={cropTypeData} margin={{ left: -20, right: 6, top: 6, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip {...tooltipStyle} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                <Bar dataKey="value" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart label="No crops added yet" />}
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { to: "/ai-chat", k: "open_chat", icon: MessageSquare },
          { to: "/crop-analysis", k: "open_analysis", icon: Camera },
          { to: "/farm", k: "open_farm", icon: Tractor },
        ].map((q) => (
          <Link key={q.to} to={q.to}>
            <Card className="group cursor-pointer p-6 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
              <q.icon className="h-6 w-6 text-primary" />
              <div className="mt-4 flex items-center justify-between">
                <span className="font-semibold">{t(`dashboard.${q.k}`)}</span>
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Upcoming tasks */}
      <div>
        <h2 className="font-display text-xl font-semibold">{t("dashboard.recent_tasks")}</h2>
        <Card className="mt-3 divide-y">
          {tasksQ.data && tasksQ.data.length > 0 ? tasksQ.data.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{task.title}</div>
                <div className="text-xs text-muted-foreground">{task.due_date ?? "—"} · {task.priority}</div>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs">{task.status}</span>
            </div>
          )) : <div className="p-6 text-center text-sm text-muted-foreground">{t("dashboard.no_tasks")}</div>}
        </Card>
      </div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="grid h-[220px] place-items-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}
