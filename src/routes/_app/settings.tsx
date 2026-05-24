import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import i18n from "@/lib/i18n";
import { useState } from "react";

export const Route = createFileRoute("/_app/settings")({ component: Settings });

function Settings() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [lang, setLang] = useState(i18n.language);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold">{t("settings.title")}</h1>
      <Card className="p-6">
        <div className="text-sm font-semibold">{t("settings.language")}</div>
        <div className="mt-3 flex gap-2">
          {[{c:"en",l:"English"},{c:"mr",l:"मराठी"},{c:"hi",l:"हिंदी"}].map((x) => (
            <Button key={x.c} variant={lang===x.c?"default":"outline"} onClick={() => { i18n.changeLanguage(x.c); setLang(x.c); }}>{x.l}</Button>
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <div className="text-sm font-semibold">{t("settings.theme")}</div>
        <div className="mt-3 flex gap-2">
          {["light","dark","system"].map((m) => (
            <Button key={m} variant={theme===m?"default":"outline"} onClick={() => setTheme(m as any)}>{t(`settings.${m}`)}</Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
