import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data?.session?.user) {
        return { user: data.session.user };
      }
    } catch {
      /* ignore supabase error and check demo session */
    }

    const isDemo = typeof window !== "undefined" && localStorage.getItem("flowform_demo_auth") === "true";
    if (isDemo) {
      return { user: { id: "demo-user", email: "demo@flowform.app" } };
    }

    throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});

