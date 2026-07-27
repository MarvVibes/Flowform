import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  Image as ImageIcon,
  Mail,
  MousePointer2,
  Palette,
  Share2,
  Sparkles,
  Zap,
  SlidersHorizontal,
  QrCode,
  Lock,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { FIELD_TYPES, THEMES } from "@/lib/form-schema";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FlowForm — The easiest, most beautiful way to build a form" },
      {
        name: "description",
        content:
          "Describe what you need. FlowForm writes the questions, picks the right field types and hands you a link worth sharing.",
      },
      { property: "og:title", content: "FlowForm — Build forms with AI in seconds" },
      {
        property: "og:description",
        content:
          "Describe what you need. FlowForm writes the questions, picks the right field types and hands you a link worth sharing.",
      },
    ],
  }),
  component: Landing,
});

const DEMOS = [
  {
    prompt: "Sign-ups for our rooftop launch party",
    questions: ["Your full name", "Email address", "How many guests are you bringing?", "Any dietary needs?"],
  },
  {
    prompt: "Feedback form for my coffee shop",
    questions: ["How was your visit today?", "What did you order?", "Rate the service", "Anything we should fix?"],
  },
  {
    prompt: "Applications for a design mentorship",
    questions: ["Your name", "Portfolio link", "What do you want to get better at?", "How much time can you commit?"],
  },
];

function Landing() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(Boolean(data.session) || localStorage.getItem("flowform_demo_auth") === "true");
    }).catch(() => {
      setSignedIn(localStorage.getItem("flowform_demo_auth") === "true");
    });
  }, []);

  const handleStart = () => {
    navigate({ to: signedIn ? "/dashboard" : "/auth" });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#07070C] text-slate-900 dark:text-white selection:bg-sky-100 selection:text-sky-900 transition-colors duration-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-white/8 bg-[#FAF9F6]/85 dark:bg-[#07070C]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo />
          <nav className="flex items-center gap-3">
            <ThemeToggle />
            {signedIn ? (
              <Button asChild size="sm" className="rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 hover:bg-slate-800 dark:hover:bg-white/90">
                <Link to="/dashboard">Open dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="rounded-full text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/8">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 hover:bg-slate-800 dark:hover:bg-white/90 font-semibold">
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Start free
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <Hero signedIn={signedIn} onStart={handleStart} />
        <FieldMarquee />
        <BentoGrid />
        <UniqueFeaturesSection />
        <ClosingCta onStart={handleStart} />
      </main>

      <footer className="border-t border-slate-200/80 dark:border-white/8 bg-white dark:bg-[#07070C]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row text-sm text-slate-500 dark:text-white/40">
          <Logo muted />
          <div className="flex flex-col items-center sm:items-end gap-1">
            <p>© 2026 FlowForm. The easiest, most beautiful way to build a form.</p>
            <p className="text-xs text-slate-400 dark:text-white/25">Built by <span className="font-semibold text-slate-600 dark:text-white/50">Marvelous Ndukwe</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------------------------------- Hero --------------------------------- */

function Hero({ signedIn, onStart }: { signedIn: boolean; onStart: () => void }) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-white/8 py-12 lg:py-24">
      {/* Subtle grid background pattern */}
      <div className="grid-paper pointer-events-none absolute inset-0 opacity-40 dark:opacity-10 [mask-image:radial-gradient(80%_80%_at_50%_20%,black,transparent)]" />

      <div className="relative mx-auto max-w-5xl px-5 text-center">
        {/* Top Badge matching screenshot */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 dark:border-white/15 bg-white/90 dark:bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-white/80 shadow-sm backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
          <span>Forms, written for you</span>
        </motion.div>

        {/* Main Headline matching screenshot typography */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display mt-8 text-balance text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl md:text-7xl leading-[1.08]"
        >
          The easiest, most
          <br />
          beautiful way to <span className="font-serif-italic text-sky-600 dark:text-sky-400 font-normal italic pr-1">build a form</span>
        </motion.h1>

        {/* Subtitle matching screenshot */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-pretty text-base sm:text-lg text-slate-600 dark:text-white/60 leading-relaxed font-normal"
        >
          Describe what you need. FlowForm writes the questions, picks the right field types and hands you a link worth sharing.
        </motion.p>

        {/* Action Button & Subtext matching screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onStart}
            className="group flex items-center gap-2 rounded-full bg-slate-950 dark:bg-white px-8 py-3.5 text-sm font-semibold text-white dark:text-slate-950 shadow-xl transition-all duration-200 hover:bg-slate-800 dark:hover:bg-white/90 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{signedIn ? "Open your dashboard" : "Build your first form"}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <span className="text-sm font-medium text-slate-500 dark:text-white/50">
            No setup. No template picking.
          </span>
        </motion.div>

        {/* Live Interactive AI Prompt Demo Container */}
        <div className="mt-16 mx-auto max-w-3xl">
          <PromptDemo />
        </div>
      </div>
    </section>
  );
}

/** Types a prompt, then reveals the questions AI would write for it. */
function PromptDemo() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [revealed, setRevealed] = useState(false);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const demo = DEMOS[index];

  useEffect(() => {
    setTyped("");
    setRevealed(false);
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];

    demo.prompt.split("").forEach((_, i) => {
      timeouts.current.push(
        setTimeout(() => setTyped(demo.prompt.slice(0, i + 1)), 38 * (i + 1)),
      );
    });
    const typingMs = 38 * demo.prompt.length;
    timeouts.current.push(setTimeout(() => setRevealed(true), typingMs + 400));
    timeouts.current.push(
      setTimeout(() => setIndex((i) => (i + 1) % DEMOS.length), typingMs + 5200),
    );

    return () => timeouts.current.forEach(clearTimeout);
  }, [index, demo.prompt]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.35 }}
      className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-2 shadow-2xl text-left"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/8 px-4 py-3 bg-slate-50/70 dark:bg-white/5 rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-sky-700 dark:text-sky-300 uppercase bg-sky-50 dark:bg-sky-500/15 px-2.5 py-1 rounded-full border border-sky-100 dark:border-sky-500/25">
          <Sparkles className="h-3 w-3 text-sky-600 dark:text-sky-400" /> AI Form Generator
        </span>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-slate-50/50 dark:bg-white/4 p-4">
          <p className="text-xs font-semibold text-slate-400 dark:text-white/40 uppercase tracking-wider">Your Prompt</p>
          <p className="mt-1.5 text-base font-medium text-slate-800 dark:text-white min-h-[28px] flex items-center">
            {typed}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="ml-1 inline-block h-5 w-[2px] bg-sky-600 dark:bg-sky-400"
            />
          </p>
        </div>

        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {revealed &&
              demo.questions.map((question, i) => (
                <motion.div
                  key={`${index}-${question}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-white/8 bg-white dark:bg-white/4 px-4 py-3 shadow-sm hover:border-sky-200 dark:hover:border-sky-400/30 transition-colors"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-600 text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700 dark:text-white/80">{question}</span>
                  <Check className="h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
                </motion.div>
              ))}
          </AnimatePresence>
          {!revealed && (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-11 animate-pulse rounded-xl bg-slate-100/70 dark:bg-white/6" />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------- Marquee -------------------------------- */

function FieldMarquee() {
  const items = useMemo(() => [...FIELD_TYPES, ...FIELD_TYPES], []);
  return (
    <section aria-label="Field types" className="overflow-hidden border-b border-slate-200 dark:border-white/8 bg-white dark:bg-[#07070C] py-5">
      <div className="flex w-max animate-marquee gap-3 pr-3">
        {items.map((field, i) => (
          <span
            key={`${field.type}-${i}`}
            className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-600 dark:text-white/60 transition-colors hover:border-sky-300 dark:hover:border-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
          >
            {field.label}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------- Bento Grid -------------------------------- */

function BentoGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-24">
      <div className="max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">Built Different</span>
        <h2 className="font-display mt-2 text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Everything your form needs. <br />
          <span className="font-serif-italic text-sky-600 dark:text-sky-400 font-normal italic">Nothing it doesn't.</span>
        </h2>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-600 dark:text-white/60 leading-relaxed">
          Google Forms gives you an old settings panel. FlowForm gives you a state-of-the-art form experience respondents actually love completing.
        </p>
      </div>

      <div className="mt-8 sm:mt-14 grid gap-4 sm:gap-6 md:grid-cols-3">
        <BentoTile className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-white to-sky-50/30 dark:from-white/5 dark:to-sky-500/5" icon={Palette} title="Editorial Themes & Typography">
          <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed">
            Minimal, Signature Flow, Midnight, Sunset, and Forest. Beautifully styled fonts, harmonious colors, and rounded corners tailored for every brand.
          </p>
          <ThemePeek />
        </BentoTile>

        <BentoTile icon={MousePointer2} title="Drag-and-Drop Builder">
          <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed">
            12 essential field types. Reorder questions effortlessly and auto-save as you type.
          </p>
        </BentoTile>

        <BentoTile icon={ImageIcon} title="Event Flyer Covers">
          <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed">
            Upload your flyer or banner and it seamlessly integrates into the header of your published form.
          </p>
        </BentoTile>

        <BentoTile icon={Sparkles} title="AI Question Polish">
          <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed">
            One click rewrites vague or clunky questions into conversational prompts that boost completion rates.
          </p>
        </BentoTile>

        <BentoTile icon={BarChart3} title="Smart Response Analytics">
          <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed">
            Instant search, individual answer cards, automated AI executive summaries, and clean CSV export.
          </p>
        </BentoTile>

        <BentoTile icon={Mail} title="Instant Notifications">
          <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed">
            Receive notifications immediately when a new submission arrives, with instant receipt for respondents.
          </p>
        </BentoTile>

        <BentoTile className="md:col-span-2" icon={Share2} title="Publish to a link worth sharing">
          <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed">
            One toggle turns your draft into a live, high-converting form with your personalized completion message.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-sky-100 dark:border-sky-500/20 bg-sky-50/60 dark:bg-sky-500/10 px-3.5 sm:px-4 py-3 font-mono text-xs text-sky-900 dark:text-sky-300 shadow-inner">
            <span className="truncate font-semibold">flowform.app/f/rooftop-launch-party</span>
            <span className="self-start sm:self-auto rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
              Live
            </span>
          </div>
        </BentoTile>
      </div>
    </section>
  );
}

function BentoTile({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      className={cn(
        "group flex flex-col rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/4 p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-sky-200 dark:hover:border-sky-400/30",
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display mt-4 sm:mt-5 text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
      <div className="mt-2 flex-1">{children}</div>
    </motion.article>
  );
}

/** Theme Preview Component */
function ThemePeek() {
  const [active, setActive] = useState(THEMES[0].id);
  const theme = THEMES.find((t) => t.id === active) ?? THEMES[0];

  return (
    <div className="mt-5 sm:mt-6">
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            aria-pressed={active === t.id}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-all",
              active === t.id
                ? "border-sky-600 bg-sky-600 text-white shadow-md"
                : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-white/70 hover:border-slate-300 dark:hover:border-white/20",
            )}
          >
            <span className="flex overflow-hidden rounded-full">
              {t.swatch.map((c) => (
                <span key={c} className="h-3 w-1.5" style={{ background: c }} />
              ))}
            </span>
            {t.name}
          </button>
        ))}
      </div>

      <motion.div
        key={theme.id}
        data-form-theme={theme.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-4 sm:mt-5 overflow-hidden border p-4 sm:p-6 shadow-md"
        style={{
          background: "var(--form-bg)",
          color: "var(--form-ink)",
          borderColor: "var(--form-border)",
          borderRadius: "calc(var(--form-radius) + 4px)",
        }}
      >
        <p className="text-lg sm:text-xl font-bold" style={{ fontFamily: "var(--form-display)" }}>
          Rooftop Launch Party
        </p>
        <p className="mt-1 text-xs sm:text-sm" style={{ color: "var(--form-muted)" }}>
          Tell us you're coming — takes 30 seconds.
        </p>
        <div
          className="mt-3 sm:mt-4 h-9 sm:h-10 w-full border"
          style={{ borderColor: "var(--form-border)", borderRadius: "var(--form-radius)", background: "var(--form-panel)" }}
        />
        <div
          className="mt-3 sm:mt-4 inline-flex px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider"
          style={{
            background: "var(--form-accent)",
            color: "var(--form-accent-ink)",
            borderRadius: "var(--form-radius)",
          }}
        >
          Submit Response
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------ Unique Features Section ------------------------ */

function UniqueFeaturesSection() {
  const uniqueFeatures = [
    {
      icon: SlidersHorizontal,
      title: "Interactive Card Step Mode",
      desc: "Switch between standard scroll view and single-question card slides with keyboard shortcuts (Enter to next, 1-9 to select options).",
    },
    {
      icon: Zap,
      title: "AI Response Simulator",
      desc: "Generate realistic synthetic responses in 1-click to test your analytics and form flow before sending it out.",
    },
    {
      icon: QrCode,
      title: "Instant QR Code & Embed Studio",
      desc: "Generate scannable poster QR codes or copy clean iframe embed code directly to display on your site.",
    },
    {
      icon: Lock,
      title: "Expiration & Submission Limits",
      desc: "Set automatic response caps or closing dates to automatically lock forms when filled.",
    },
  ];

  return (
    <section className="border-t border-slate-200/80 dark:border-white/8 bg-white dark:bg-[#07070C] py-10 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">Why FlowForm Wins</span>
          <h2 className="font-display mt-2 text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Features Google Forms <span className="font-serif-italic text-sky-600 dark:text-sky-400 font-normal italic">doesn't have</span>
          </h2>
        </div>

        <div className="mt-8 sm:mt-14 grid gap-4 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {uniqueFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-slate-100 dark:border-white/8 bg-slate-50/60 dark:bg-white/4 p-5 sm:p-6 transition-all hover:bg-white dark:hover:bg-white/8 hover:shadow-lg hover:border-sky-200 dark:hover:border-sky-400/30"
            >
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md">
                <f.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-bold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-white/60 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Closing CTA -------------------------------- */

function ClosingCta({ onStart }: { onStart: () => void }) {
  return (
    <section className="border-t border-slate-200/80 dark:border-white/8 bg-[#FAF9F6] dark:bg-[#07070C]">
      <div className="grid-paper py-12 sm:py-28 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Your next form is <br />
            <span className="font-serif-italic text-sky-600 dark:text-sky-400 font-normal italic">one sentence</span> away.
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-600 dark:text-white/60">
            Join thousands creating beautiful forms with zero effort.
          </p>
          <button
            onClick={onStart}
            className="mt-6 sm:mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 dark:bg-white px-7 sm:px-9 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white dark:text-slate-950 shadow-2xl transition-all hover:bg-slate-800 dark:hover:bg-white/90 hover:scale-105"
          >
            <span>Start building now</span>
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
