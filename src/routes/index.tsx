import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Sprout, Camera, MessageSquare, Cloud, Leaf, Languages, ArrowRight,
  CheckCircle2, Sparkles, Star, ShieldCheck, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState, useEffect, useRef } from "react";
import i18n from "@/lib/i18n";
import heroImage from "@/assets/hero-farm.jpg";

export const Route = createFileRoute("/")({ component: Landing });

const LANGS = [
  { code: "en", label: "EN" },
  { code: "mr", label: "मराठी" },
  { code: "hi", label: "हिं" },
];

function Nav() {
  const { t } = useTranslation();
  const [lang, setLang] = useState(i18n.language);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-border/60 bg-background/85 shadow-sm backdrop-blur-xl" : "bg-background/30 backdrop-blur-md"}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl gradient-hero text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 group-hover:rotate-6">
            <Sprout className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">{t("brand")}</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="story-link transition-colors hover:text-foreground">{t("nav.features")}</a>
          <a href="#how" className="story-link transition-colors hover:text-foreground">{t("nav.how")}</a>
          <a href="#benefits" className="story-link transition-colors hover:text-foreground">{t("nav.benefits")}</a>
          <a href="#faq" className="story-link transition-colors hover:text-foreground">{t("nav.faq")}</a>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-full border border-border bg-muted/50 p-1 text-xs sm:flex">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => { i18n.changeLanguage(l.code); setLang(l.code); }}
                className={`rounded-full px-2.5 py-1 transition ${lang === l.code ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
              >{l.label}</button>
            ))}
          </div>
          <Button asChild variant="ghost" size="sm"><Link to="/login">{t("nav.login")}</Link></Button>
          <Button asChild size="sm" className="rounded-full shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30">
            <Link to="/register">{t("nav.signup")}<ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden bg-grain">
      {/* Animated orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-float-slow" />
        <div className="absolute -right-32 top-40 h-[28rem] w-[28rem] rounded-full bg-accent/25 blur-3xl animate-float-rev" />
        <div className="absolute left-1/3 -bottom-40 h-96 w-96 rounded-full bg-primary/15 blur-3xl animate-float-slow" />
      </div>
      <div aria-hidden className="absolute inset-0 bg-grid opacity-60" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-2 md:items-center md:py-32">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {t("hero.kicker")}
          </motion.span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            <span className="text-gradient">{t("hero.title")}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">{t("hero.subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="group rounded-full px-7 shadow-xl shadow-primary/25 transition hover:shadow-2xl hover:shadow-primary/40">
              <Link to="/register">
                <Sparkles className="mr-2 h-4 w-4" />
                {t("hero.cta_primary")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-2 px-7">
              <Link to="/login">{t("hero.cta_secondary")}</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
            <div className="flex -space-x-2">
              {["#84cc16", "#f59e0b", "#22c55e", "#06b6d4"].map((c) => (
                <div key={c} className="h-7 w-7 rounded-full border-2 border-background" style={{ background: c }} />
              ))}
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />)}
              <span className="ml-1.5 font-medium text-foreground">4.9</span>
              <span>· 12,400+ farmers</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] gradient-hero p-1.5 shadow-2xl glow-primary">
            <div className="relative h-full w-full overflow-hidden rounded-[1.6rem]">
              <img src={heroImage} alt="Maharashtra farmland at golden hour" className="h-full w-full object-cover" width={1024} height={1280} />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />

              {/* Floating product cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="absolute left-5 top-5 flex items-center gap-2.5 rounded-2xl border border-border/60 bg-card/90 px-3.5 py-2.5 shadow-xl backdrop-blur-xl"
              >
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary"><Camera className="h-4 w-4" /></div>
                <div>
                  <div className="text-xs font-semibold">Tomato leaf blight</div>
                  <div className="text-[10px] text-muted-foreground">Severity: moderate · 98% confidence</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
                className="absolute right-4 top-1/3 flex items-center gap-2.5 rounded-2xl border border-border/60 bg-card/90 px-3.5 py-2.5 shadow-xl backdrop-blur-xl"
              >
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/20 text-accent-foreground"><MessageSquare className="h-4 w-4" /></div>
                <div>
                  <div className="text-xs font-semibold">मॉन्सून मध्ये कोणते खत?</div>
                  <div className="text-[10px] text-muted-foreground">AI agronomist · Marathi</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl border border-border/60 bg-card/90 px-4 py-3 shadow-xl backdrop-blur-xl"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl gradient-hero text-primary-foreground"><Cloud className="h-5 w-5" /></div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">Rain expected in 2 days</div>
                  <div className="text-xs text-muted-foreground">Pune district · 24mm</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </div>
          </div>
          {/* decorative ring */}
          <div aria-hidden className="absolute -inset-4 -z-10 rounded-[2.5rem] border border-primary/10" />
        </motion.div>
      </div>

      {/* Stats strip */}
      <div className="relative border-y border-border/60 bg-card/50 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border/60 px-4 md:grid-cols-4">
          {[
            { v: "12,400+", l: "Active farmers", icon: Sprout },
            { v: "8 sec", l: "Avg. diagnosis time", icon: Zap },
            { v: "94%", l: "Accuracy on key crops", icon: ShieldCheck },
            { v: "3", l: "Languages supported", icon: Languages },
          ].map((s) => (
            <div key={s.l} className="flex items-center gap-3 px-4 py-5 sm:px-6">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><s.icon className="h-5 w-5" /></div>
              <div>
                <div className="font-display text-xl font-bold sm:text-2xl">{s.v}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["Tomato 🍅", "Cotton 🌿", "Sugarcane 🎋", "Onion 🧅", "Soybean 🌱", "Grapes 🍇", "Pomegranate", "Wheat 🌾", "Rice 🍚", "Banana 🍌", "Chili 🌶️", "Turmeric"];
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-b border-border bg-background py-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <div className="flex w-max animate-marquee gap-3">
        {row.map((c, i) => (
          <span key={i} className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium text-muted-foreground">
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function Features() {
  const { t } = useTranslation();
  const items = [
    { k: "ai", icon: MessageSquare },
    { k: "disease", icon: Camera },
    { k: "farm", icon: Sprout },
    { k: "tasks", icon: CheckCircle2 },
    { k: "weather", icon: Cloud },
    { k: "multi", icon: Languages },
  ];
  return (
    <section id="features" className="relative py-24">
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Features
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">{t("features.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("features.subtitle")}</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <motion.div
              key={it.k}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }} transition={{ delay: i * 0.06, duration: 0.5 }}
              className="group relative overflow-hidden rounded-2xl border-gradient p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10"
            >
              <div aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />
              <div className="relative grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/40">
                <it.icon className="h-6 w-6" />
              </div>
              <h3 className="relative mt-5 font-display text-lg font-semibold">{t(`features.items.${it.k}.t`)}</h3>
              <p className="relative mt-2 text-sm text-muted-foreground">{t(`features.items.${it.k}.d`)}</p>
              <div className="relative mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Learn more <ArrowRight className="h-3 w-3" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useTranslation();
  const steps = ["s1", "s2", "s3"] as const;
  return (
    <section id="how" className="relative border-y border-border bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold md:text-5xl">{t("how.title")}</h2>
        </div>
        <div className="relative mt-16 grid gap-6 md:grid-cols-3">
          <div aria-hidden className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />
          {steps.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl border border-border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute -top-5 left-7 grid h-10 w-10 place-items-center rounded-full gradient-hero font-display text-lg font-bold text-primary-foreground shadow-lg shadow-primary/30">{i + 1}</div>
              <h3 className="mt-4 font-display text-xl font-semibold">{t(`how.${s}.t`)}</h3>
              <p className="mt-2 text-muted-foreground">{t(`how.${s}.d`)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const { t } = useTranslation();
  const items = t("benefits.items", { returnObjects: true }) as string[];
  return (
    <section id="benefits" className="py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-2 md:items-center">
        <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="font-display text-3xl font-bold md:text-5xl"><span className="shimmer-text">{t("benefits.title")}</span></h2>
          <ul className="mt-8 space-y-4">
            {items.map((b, i) => (
              <motion.li
                key={b}
                initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 rounded-xl border border-transparent p-3 transition hover:border-border hover:bg-card"
              >
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10"><CheckCircle2 className="h-4 w-4 text-primary" /></div>
                <span className="text-lg">{b}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl gradient-hero p-10 text-primary-foreground shadow-2xl glow-primary"
        >
          <div aria-hidden className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <h3 className="relative font-display text-2xl font-bold">{t("testimonials.title")}</h3>
          <div className="relative mt-6 space-y-4">
            {(t("testimonials.items", { returnObjects: true }) as Array<{ name: string; loc: string; text: string }>).map((tm, i) => (
              <motion.blockquote
                key={tm.name}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
              >
                <div className="mb-2 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-3 w-3 fill-current text-accent" />)}
                </div>
                <p className="text-sm leading-relaxed">"{tm.text}"</p>
                <footer className="mt-2 text-xs opacity-80">— {tm.name}, {tm.loc}</footer>
              </motion.blockquote>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FAQ() {
  const { t } = useTranslation();
  const items = t("faq.items", { returnObjects: true }) as Array<{ q: string; a: string }>;
  return (
    <section id="faq" className="border-t border-border bg-muted/30 py-24">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center font-display text-3xl font-bold md:text-5xl">{t("faq.title")}</h2>
        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {items.map((it, i) => (
            <AccordionItem key={i} value={`i-${i}`} className="rounded-2xl border border-border bg-card px-5">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">{it.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{it.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function CTA() {
  const { t } = useTranslation();
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="relative overflow-hidden rounded-[2rem] gradient-hero p-12 text-center text-primary-foreground shadow-2xl glow-primary md:p-16">
          <div aria-hidden className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-float-slow" />
          <div aria-hidden className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl animate-float-rev" />
          <span className="relative inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Free for individual farmers
          </span>
          <h2 className="relative mt-5 font-display text-3xl font-bold leading-tight md:text-5xl">{t("hero.title")}</h2>
          <p className="relative mx-auto mt-4 max-w-xl opacity-90">{t("hero.subtitle")}</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="rounded-full px-7 shadow-xl">
              <Link to="/register">{t("hero.cta_primary")}<ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/40 bg-transparent px-7 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
              <Link to="/login">{t("hero.cta_secondary")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border bg-card py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <Sprout className="h-4 w-4 text-primary" />
          <span>© {new Date().getFullYear()} {t("brand")}. {t("footer.rights")}</span>
        </div>
        <span>{t("footer.made")}</span>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Features />
        <HowItWorks />
        <Benefits />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
