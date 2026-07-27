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
  Star,
  Users,
  TrendingUp,
  Globe,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
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

const TESTIMONIALS = [
  {
    quote: "Built my event RSVP in literally 45 seconds. The AI just... got it.",
    author: "Priya K.",
    role: "Event Producer",
    stars: 5,
  },
  {
    quote: "Finally a form tool that doesn't look like it was designed in 2012.",
    author: "James T.",
    role: "Brand Designer",
    stars: 5,
  },
  {
    quote: "The QR code feature alone saved me hours of back-and-forth.",
    author: "Sofia R.",
    role: "Marketing Lead",
    stars: 5,
  },
  {
    quote: "My respondents actually compliment how beautiful the forms look.",
    author: "Marcus L.",
    role: "Founder, Startups",
    stars: 5,
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
    <div className="min-h-screen bg-[#07070C] text-white overflow-x-hidden selection:bg-violet-500/30 selection:text-violet-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#07070C]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {signedIn ? (
              <Button asChild size="sm" className="rounded-full bg-white text-slate-900 hover:bg-white/90 px-4 sm:px-5 text-xs sm:text-sm">
                <Link to="/dashboard">Open dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="rounded-full text-white/70 hover:text-white hover:bg-white/8 text-xs sm:text-sm">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="rounded-full bg-white text-slate-900 hover:bg-white/90 px-4 sm:px-5 text-xs sm:text-sm font-semibold">
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
        <StatsBar />
        <FieldMarquee />
        <BentoGrid />
        <TestimonialsSection />
        <UniqueFeaturesSection />
        <ClosingCta onStart={handleStart} />
      </main>

      <footer className="border-t border-white/8 bg-[#07070C]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 py-10 sm:flex-row text-sm text-white/40">
          <Logo />
          <div className="flex flex-col items-center sm:items-end gap-1">
            <p>© 2026 FlowForm. The easiest, most beautiful way to build a form.</p>
            <p className="text-xs text-white/25">Built by <span className="font-semibold text-white/50">Marvelous Ndukwe</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}



/* ---------------------------------- Hero --------------------------------- */

function Hero({ signedIn, onStart }: { signedIn: boolean; onStart: () => void }) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
      {/* Ambient background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] sm:h-[900px] sm:w-[900px] rounded-full bg-violet-600/12 blur-[120px]" />
        <div className="absolute top-1/3 -left-20 h-[400px] w-[400px] rounded-full bg-sky-500/8 blur-[100px]" />
        <div className="absolute top-1/3 -right-20 h-[400px] w-[400px] rounded-full bg-pink-500/8 blur-[100px]" />
      </div>

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          <span>AI-powered forms, written for you</span>
          <span className="rounded-full bg-violet-500/30 px-2 py-0.5 text-[10px] font-bold text-violet-300 uppercase tracking-wider">New</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8 text-balance text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05]"
        >
          <span className="text-white">The easiest,</span>
          <br />
          <span className="text-white">most beautiful</span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-sky-400 bg-clip-text text-transparent font-serif italic font-normal">
            way to build a form
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-pretty text-base sm:text-lg text-white/55 leading-relaxed"
        >
          Describe what you need. FlowForm writes the questions, picks the right field types and hands you a link worth sharing.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <button
            onClick={onStart}
            className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-7 sm:px-8 py-3.5 text-sm font-bold text-slate-900 shadow-2xl shadow-white/10 transition-all duration-200 hover:bg-white/90 hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{signedIn ? "Open your dashboard" : "Build your first form"}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <span className="text-sm font-medium text-white/40 hidden sm:block">
            No setup. No template picking.
          </span>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <div className="flex -space-x-2">
            {["🧑‍💻", "👩‍🎨", "🧑‍🚀", "👩‍💼", "🧑‍🔬"].map((emoji, i) => (
              <span
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#07070C] bg-gradient-to-br from-violet-500/40 to-pink-500/40 text-xs"
              >
                {emoji}
              </span>
            ))}
          </div>
          <p className="text-xs text-white/40">
            <span className="font-semibold text-white/70">2,000+</span> creators building with FlowForm
          </p>
        </motion.div>

        {/* Live Interactive Demo */}
        <div className="mt-16 mx-auto max-w-3xl w-full">
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
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-1.5 sm:p-2 shadow-2xl shadow-black/50 text-left"
    >
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3 bg-white/4 rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-violet-300 uppercase bg-violet-500/15 px-2.5 py-1 rounded-full border border-violet-500/25">
          <Sparkles className="h-3 w-3" /> AI Form Generator
        </span>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        <div className="rounded-xl border border-white/8 bg-white/4 p-4">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Your Prompt</p>
          <p className="mt-1.5 text-base font-medium text-white min-h-[28px] flex items-center">
            {typed}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="ml-1 inline-block h-5 w-[2px] bg-violet-400"
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
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-4 py-3 hover:border-violet-500/30 hover:bg-violet-500/5 transition-colors"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-violet-500/80 text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-white/80">{question}</span>
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                </motion.div>
              ))}
          </AnimatePresence>
          {!revealed && (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-11 animate-pulse rounded-xl bg-white/6" />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------- Stats Bar -------------------------------- */

function StatsBar() {
  const stats = [
    { label: "Forms Created", value: "10K+", icon: Sparkles },
    { label: "Responses Collected", value: "500K+", icon: TrendingUp },
    { label: "Happy Creators", value: "2,000+", icon: Users },
    { label: "Countries Reached", value: "40+", icon: Globe },
  ];

  return (
    <section className="border-y border-white/6 bg-white/2 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center gap-1 text-center"
            >
              <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stat.value}</p>
              <p className="text-xs text-white/40 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Marquee -------------------------------- */

function FieldMarquee() {
  const items = useMemo(() => [...FIELD_TYPES, ...FIELD_TYPES], []);
  return (
    <section aria-label="Field types" className="overflow-hidden border-b border-white/6 bg-transparent py-5">
      <div className="flex w-max animate-marquee gap-3 pr-3">
        {items.map((field, i) => (
          <span
            key={`${field.type}-${i}`}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/60 transition-colors hover:border-violet-500/40 hover:text-violet-300 whitespace-nowrap"
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
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-widest text-violet-400">Built Different</span>
        <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Everything your form needs.{" "}
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent font-serif italic font-normal">
            Nothing it doesn't.
          </span>
        </h2>
        <p className="mt-4 text-base text-white/50 leading-relaxed">
          Google Forms gives you an old settings panel. FlowForm gives you a state-of-the-art form experience respondents actually love completing.
        </p>
      </div>

      <div className="mt-12 sm:mt-16 grid auto-rows-[minmax(0,1fr)] gap-4 sm:gap-6 md:grid-cols-3">
        <BentoTile className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-violet-500/8 to-pink-500/5" icon={Palette} title="Editorial Themes & Typography" accent="violet">
          <p className="text-sm text-white/55 leading-relaxed">
            Minimal, Signature Flow, Midnight, Sunset, and Forest. Beautifully styled fonts, harmonious colors, and rounded corners tailored for every brand.
          </p>
          <ThemePeek />
        </BentoTile>

        <BentoTile icon={MousePointer2} title="Drag-and-Drop Builder" accent="sky">
          <p className="text-sm text-white/55 leading-relaxed">
            12 essential field types. Reorder questions effortlessly and auto-save as you type.
          </p>
        </BentoTile>

        <BentoTile icon={ImageIcon} title="Event Flyer Covers" accent="pink">
          <p className="text-sm text-white/55 leading-relaxed">
            Upload your flyer or banner and it seamlessly integrates into the header of your published form.
          </p>
        </BentoTile>

        <BentoTile icon={Sparkles} title="AI Question Polish" accent="violet">
          <p className="text-sm text-white/55 leading-relaxed">
            One click rewrites vague or clunky questions into conversational prompts that boost completion rates.
          </p>
        </BentoTile>

        <BentoTile icon={BarChart3} title="Smart Response Analytics" accent="emerald">
          <p className="text-sm text-white/55 leading-relaxed">
            Instant search, individual answer cards, automated AI executive summaries, and clean CSV export.
          </p>
        </BentoTile>

        <BentoTile icon={Mail} title="Instant Notifications" accent="sky">
          <p className="text-sm text-white/55 leading-relaxed">
            Receive notifications immediately when a new submission arrives, with instant receipt for respondents.
          </p>
        </BentoTile>

        <BentoTile className="md:col-span-2" icon={Share2} title="Publish to a link worth sharing" accent="emerald">
          <p className="text-sm text-white/55 leading-relaxed">
            One toggle turns your draft into a live, high-converting form with your personalized completion message.
          </p>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 font-mono text-xs text-emerald-300 shadow-inner">
            <span className="truncate font-semibold">flowform.app/f/rooftop-launch-party</span>
            <span className="ml-3 shrink-0 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
              Live
            </span>
          </div>
        </BentoTile>
      </div>
    </section>
  );
}

const accentMap = {
  violet: { bg: "bg-violet-500/15", icon: "text-violet-400", border: "hover:border-violet-500/30" },
  sky: { bg: "bg-sky-500/15", icon: "text-sky-400", border: "hover:border-sky-500/30" },
  pink: { bg: "bg-pink-500/15", icon: "text-pink-400", border: "hover:border-pink-500/30" },
  emerald: { bg: "bg-emerald-500/15", icon: "text-emerald-400", border: "hover:border-emerald-500/30" },
};

function BentoTile({
  icon: Icon,
  title,
  children,
  className,
  accent = "violet",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  className?: string;
  accent?: keyof typeof accentMap;
}) {
  const a = accentMap[accent];
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      className={cn(
        "group flex flex-col rounded-2xl border border-white/8 bg-white/3 p-6 sm:p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 hover:bg-white/5",
        a.border,
        className,
      )}
    >
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110", a.bg)}>
        <Icon className={cn("h-5 w-5", a.icon)} />
      </div>
      <h3 className="mt-5 text-lg sm:text-xl font-bold text-white">{title}</h3>
      <div className="mt-2 flex-1">{children}</div>
    </motion.article>
  );
}

/** Theme Preview Component */
function ThemePeek() {
  const [active, setActive] = useState(THEMES[0].id);
  const theme = THEMES.find((t) => t.id === active) ?? THEMES[0];

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            aria-pressed={active === t.id}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
              active === t.id
                ? "border-violet-500 bg-violet-500/20 text-violet-300 shadow-md"
                : "border-white/10 bg-white/5 text-white/60 hover:border-white/20",
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
        className="mt-5 overflow-hidden border p-6 shadow-md"
        style={{
          background: "var(--form-bg)",
          color: "var(--form-ink)",
          borderColor: "var(--form-border)",
          borderRadius: "calc(var(--form-radius) + 4px)",
        }}
      >
        <p className="text-xl font-bold" style={{ fontFamily: "var(--form-display)" }}>
          Rooftop Launch Party
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--form-muted)" }}>
          Tell us you're coming — takes 30 seconds.
        </p>
        <div
          className="mt-4 h-10 w-full border"
          style={{ borderColor: "var(--form-border)", borderRadius: "var(--form-radius)", background: "var(--form-panel)" }}
        />
        <div
          className="mt-4 inline-flex px-5 py-2.5 text-xs font-bold uppercase tracking-wider"
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

/* -------------------------------- Testimonials -------------------------------- */

function TestimonialsSection() {
  return (
    <section className="border-t border-white/6 bg-white/1 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-pink-400">Loved By Creators</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            What people are{" "}
            <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent font-serif italic font-normal">
              saying
            </span>
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-white/4 p-6 backdrop-blur hover:border-pink-500/20 hover:bg-white/6 transition-all"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-white/75 leading-relaxed flex-1">"{t.quote}"</p>
              <div>
                <p className="text-sm font-bold text-white">{t.author}</p>
                <p className="text-xs text-white/40">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------ Unique Features Section ------------------------ */

function UniqueFeaturesSection() {
  const uniqueFeatures = [
    {
      icon: SlidersHorizontal,
      title: "Interactive Card Step Mode",
      desc: "Switch between standard scroll view and single-question card slides with keyboard shortcuts (Enter to next, 1-9 to select options).",
      accent: "violet",
    },
    {
      icon: Zap,
      title: "AI Response Simulator",
      desc: "Generate realistic synthetic responses in 1-click to test your analytics and form flow before sending it out.",
      accent: "amber",
    },
    {
      icon: QrCode,
      title: "Instant QR Code & Embed Studio",
      desc: "Generate scannable poster QR codes or copy clean iframe embed code directly to display on your site.",
      accent: "sky",
    },
    {
      icon: Lock,
      title: "Expiration & Submission Limits",
      desc: "Set automatic response caps or closing dates to automatically lock forms when filled.",
      accent: "pink",
    },
  ] as const;

  const accentColors = {
    violet: { bg: "bg-violet-500/15", text: "text-violet-400", glow: "hover:shadow-violet-500/10" },
    amber: { bg: "bg-amber-500/15", text: "text-amber-400", glow: "hover:shadow-amber-500/10" },
    sky: { bg: "bg-sky-500/15", text: "text-sky-400", glow: "hover:shadow-sky-500/10" },
    pink: { bg: "bg-pink-500/15", text: "text-pink-400", glow: "hover:shadow-pink-500/10" },
  };

  return (
    <section className="border-t border-white/6 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400">Why FlowForm Wins</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Features Google Forms{" "}
            <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent font-serif italic font-normal">
              doesn't have
            </span>
          </h2>
        </div>

        <div className="mt-12 sm:mt-14 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {uniqueFeatures.map((f, i) => {
            const a = accentColors[f.accent];
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "rounded-2xl border border-white/8 bg-white/3 p-6 transition-all hover:bg-white/6 hover:-translate-y-1 hover:shadow-xl",
                  a.glow,
                )}
              >
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl shadow-md", a.bg)}>
                  <f.icon className={cn("h-6 w-6", a.text)} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Closing CTA -------------------------------- */

function ClosingCta({ onStart }: { onStart: () => void }) {
  return (
    <section className="border-t border-white/6 relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-transparent to-pink-600/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-violet-500/8 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative py-20 sm:py-32 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300 mb-6">
              <Sparkles className="h-3 w-3" /> Free to start
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Your next form is{" "}
              <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-sky-400 bg-clip-text text-transparent font-serif italic font-normal">
                one sentence
              </span>{" "}
              away.
            </h2>
            <p className="mt-4 text-base text-white/50">
              Join thousands creating beautiful forms with zero effort.
            </p>
            <button
              onClick={onStart}
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-9 py-4 text-base font-bold text-slate-900 shadow-2xl shadow-white/10 transition-all hover:bg-white/90 hover:scale-105 hover:shadow-white/20"
            >
              <span>Start building now</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="mt-4 text-xs text-white/30">No credit card required · Cancel anytime</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
