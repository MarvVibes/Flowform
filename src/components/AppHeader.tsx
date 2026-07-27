import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, LayoutGrid, Bell, Check, Inbox } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Logo } from "@/components/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export function AppHeader({ children }: { children?: React.ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState<string>("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email || "demo@flowform.app");
    }).catch(() => {
      setEmail("demo@flowform.app");
    });

    // Populate mock & local notifications
    const mockNotifs: NotificationItem[] = [
      {
        id: "n1",
        title: "New Registration Entry",
        message: "Taylor Chen submitted a response to Rooftop Launch Party RSVP.",
        time: "Just now",
        read: false,
      },
      {
        id: "n2",
        title: "New Customer Feedback",
        message: "Morgan Smith rated your coffee shop 5/5 stars.",
        time: "10m ago",
        read: false,
      },
      {
        id: "n3",
        title: "Applicant Confirmation Sent",
        message: "Registration receipt email delivered to taylor@company.io",
        time: "1h ago",
        read: true,
      },
    ];
    setNotifications(mockNotifs);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    localStorage.removeItem("flowform_demo_auth");
    await supabase.auth.signOut().catch(() => {});
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-5">
        <Logo />
        <div className="flex-1">{children}</div>

        <div className="flex items-center gap-2">
          {/* Owner Notification Bell */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-all outline-none"
                aria-label="Owner notifications"
              >
                <Bell className="h-5 w-5 text-slate-700" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(20rem,calc(100vw-1rem))] rounded-2xl p-2 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Inbox className="h-4 w-4 text-sky-600" /> Notifications & Alerts
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-medium text-sky-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto space-y-1 py-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-xl p-2.5 text-xs transition-colors ${
                      n.read ? "bg-slate-50/50" : "bg-sky-50/60 border border-sky-100"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                    </div>
                    <p className="mt-1 text-slate-600 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Account Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded-full outline-offset-2 focus-visible:outline-2"
                aria-label="Account menu"
              >
                <Avatar className="h-8 w-8 border border-slate-200 shadow-sm">
                  <AvatarFallback className="text-[12px] bg-slate-900 font-bold text-white">
                    {(email[0] ?? "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg">
              <div className="truncate px-3 py-2 text-xs font-medium text-slate-500 border-b border-slate-100">
                {email}
              </div>
              <DropdownMenuItem asChild className="rounded-lg">
                <Link to="/dashboard">
                  <LayoutGrid className="h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut} className="rounded-lg text-rose-600">
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
