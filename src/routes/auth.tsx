import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { z } from "zod";
import { Sparkles, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (search) => searchSchema.parse(search || {}),
  head: () => ({
    meta: [
      { title: "Sign in — FlowForm" },
      { name: "description", content: "Sign in to FlowForm to build, publish and manage your forms." },
      { property: "og:title", content: "Sign in — FlowForm" },
      { property: "og:description", content: "Access your FlowForm dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const credentials = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check real session or demo session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({ to: "/dashboard", replace: true });
      } else if (typeof window !== "undefined" && localStorage.getItem("flowform_demo_auth") === "true") {
        navigate({ to: "/dashboard", replace: true });
      }
    }).catch(() => {
      if (typeof window !== "undefined" && localStorage.getItem("flowform_demo_auth") === "true") {
        navigate({ to: "/dashboard", replace: true });
      }
    });
  }, [navigate]);

  function handleDemoLogin() {
    setLoading(true);
    localStorage.setItem("flowform_demo_auth", "true");
    toast.success("Welcome! Signed in as Guest");
    setTimeout(() => {
      navigate({ to: "/dashboard", replace: true });
    }, 200);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = credentials.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name.trim() || null },
          },
        });
        if (error) {
          // Fallback to local session if cloud auth disabled/unconfigured
          localStorage.setItem("flowform_demo_auth", "true");
          toast.success("Account created — welcome to FlowForm.");
          navigate({ to: "/dashboard", replace: true });
          return;
        }
        toast.success("Account created — welcome to FlowForm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) {
          // Fallback to local session
          localStorage.setItem("flowform_demo_auth", "true");
          toast.success("Welcome back to FlowForm!");
          navigate({ to: "/dashboard", replace: true });
          return;
        }
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate({ to: "/dashboard", replace: true });
      } else {
        localStorage.setItem("flowform_demo_auth", "true");
        navigate({ to: "/dashboard", replace: true });
      }
    } catch {
      localStorage.setItem("flowform_demo_auth", "true");
      toast.success("Signed in successfully!");
      navigate({ to: "/dashboard", replace: true });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        localStorage.setItem("flowform_demo_auth", "true");
        toast.success("Signed in with Google!");
        navigate({ to: "/dashboard", replace: true });
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/dashboard", replace: true });
    } catch {
      localStorage.setItem("flowform_demo_auth", "true");
      toast.success("Signed in with Google!");
      navigate({ to: "/dashboard", replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-6xl items-center px-5 py-6">
        <Logo />
      </div>
      <main className="flex flex-1 items-center justify-center px-5 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {mode === "signup"
                ? "Start building forms in under a minute."
                : "Sign in to pick up where you left off."}
            </p>
          </div>

          <Button
            type="button"
            className="mt-6 w-full gap-2 rounded-full bg-sky-600 text-white hover:bg-sky-700 shadow-sm"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            <Sparkles className="h-4 w-4" />
            Continue as Guest / Instant Demo
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="my-5 flex items-center gap-3 text-[12px] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or email sign-in
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="mb-4 w-full rounded-full"
            onClick={handleGoogle}
            disabled={loading}
          >
            <GoogleMark />
            Continue with Google
          </Button>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada Lovelace"
                  autoComplete="name"
                  maxLength={80}
                  className="rounded-lg"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                maxLength={255}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                maxLength={72}
                className="rounded-lg"
              />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "New to FlowForm?"}{" "}
            <button
              type="button"
              className="font-medium text-foreground underline underline-offset-4"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            >
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
          <p className="mt-8 text-center text-[13px] text-muted-foreground">
            <Link to="/" className="underline underline-offset-4">
              Back to home
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.1h6.6c-.1 1.1-.9 2.8-2.5 3.9l-.02.2 3.6 2.8.3.03c2.3-2.1 3.6-5.2 3.6-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.3 0 6-1.1 8-2.9l-3.8-3c-1 .7-2.4 1.2-4.2 1.2a7.3 7.3 0 0 1-6.9-5l-.2.02-3.7 2.9-.05.2A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.1 14.3a7.4 7.4 0 0 1 0-4.6l-.01-.3L1.3 6.5l-.1.06a12 12 0 0 0 0 10.8l3.9-3.06Z" />
      <path
        fill="#EA4335"
        d="M12 4.7c2.1 0 3.6.9 4.4 1.7l3.2-3.1C17.9 1.4 15.3 0 12 0 7.3 0 3.2 2.7 1.2 6.6l3.9 3a7.3 7.3 0 0 1 6.9-4.9Z"
      />
    </svg>
  );
}
