import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { analyzeCropImage } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Loader2, Camera } from "lucide-react";
import i18n from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/crop-analysis")({ component: CropAnalysis });

function CropAnalysis() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const analyze = useServerFn(analyzeCropImage);
  const qc = useQueryClient();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const history = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data } = await supabase.from("disease_reports").select("*").order("created_at", { ascending: false }).limit(10);
      return data ?? [];
    },
  });

  const onFile = (f: File) => {
    if (f.size > 8 * 1024 * 1024) { toast.error("Image too large (max 8MB)"); return; }
    setFile(f); setResult(null);
    const reader = new FileReader(); reader.onload = () => setPreview(reader.result as string); reader.readAsDataURL(f);
  };

  const run = async () => {
    if (!file || !user) return;
    setLoading(true);
    try {
      const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
      const { error: upErr } = await supabase.storage.from("crop-images").upload(path, file);
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("crop-images").getPublicUrl(path);
      const normalized = i18n.language?.split("-")[0] as string | undefined;
      const lang = normalized === "mr" ? "mr" : normalized === "hi" ? "hi" : "en";
      const res = await analyze({ data: { imageUrl: pub.publicUrl, language: lang } });
      setResult(res.parsed);
      qc.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Analysis complete");
    } catch (e: any) { toast.error(e.message || "Analysis failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">{t("analysis.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("analysis.subtitle")}</p>
      </div>

      <Card className="p-6">
        <label className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 transition hover:border-primary">
          {preview ? <img src={preview} alt="preview" className="h-full w-full rounded-xl object-cover" /> : (
            <><Camera className="h-10 w-10 text-muted-foreground" /><span className="text-sm text-muted-foreground">{t("analysis.upload")}</span></>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </label>
        <Button onClick={run} disabled={!file || loading} className="mt-4 w-full">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("analysis.analyzing")}</> : <><Upload className="mr-2 h-4 w-4" />{t("analysis.analyze")}</>}
        </Button>
      </Card>

      {result && (
        <Card className="space-y-3 p-6">
          {["disease","severity","causes","solutions","prevention","recommendations"].map((k) => (
            result[k] ? <div key={k}><div className="text-xs font-semibold uppercase tracking-wide text-primary">{t(`analysis.${k}`)}</div><div className="mt-1 text-sm">{result[k]}</div></div> : null
          ))}
        </Card>
      )}

      <div>
        <h2 className="font-display text-lg font-semibold">{t("analysis.history")}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {history.data && history.data.length > 0 ? history.data.map((r) => (
            <Card key={r.id} className="overflow-hidden">
              <img src={r.image_url} alt="" className="aspect-video w-full object-cover" />
              <div className="p-3">
                <div className="font-semibold">{r.disease_name || "—"}</div>
                <div className="text-xs text-muted-foreground">{r.severity || "—"} · {new Date(r.created_at).toLocaleDateString()}</div>
              </div>
            </Card>
          )) : <p className="text-sm text-muted-foreground">{t("analysis.no_history")}</p>}
        </div>
      </div>
    </div>
  );
}
