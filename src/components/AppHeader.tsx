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

import { ThemeToggle } from "@/components/ThemeToggle";

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
    <header className="sticky top-0 z-30 border-b border-white/8 bg-[#07070C]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Logo />
        <div className="flex-1">{children}</div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Owner Notification Bell */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="relative rounded-full p-2 text-white/40 hover:text-white hover:bg-white/8 transition-all outline-none"
                aria-label="Owner notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(20rem,calc(100vw-2rem))] rounded-2xl p-2 shadow-xl bg-[#111118] border-white/10">
              <div className="flex items-center justify-between border-b border-white/8 px-3 py-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Inbox className="h-4 w-4 text-violet-400" /> Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-medium text-violet-400 hover:underline"
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
                      n.read ? "bg-white/3" : "bg-violet-500/10 border border-violet-500/20"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-white/30 font-normal">{n.time}</span>
                    </div>
                    <p className="mt-1 text-white/50 leading-relaxed">{n.message}</p>
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
                <Avatar className="h-8 w-8 border border-white/15 shadow-sm">
                  <AvatarFallback className="text-[12px] bg-white font-bold text-slate-900">
                    {(email[0] ?? "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg bg-[#111118] border-white/10">
              <div className="truncate px-3 py-2 text-xs font-medium text-white/40 border-b border-white/8">
                {email}
              </div>
              <DropdownMenuItem asChild className="rounded-lg text-white/80 focus:text-white focus:bg-white/8">
                <Link to="/dashboard">
                  <LayoutGrid className="h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut} className="rounded-lg text-rose-400 focus:text-rose-300 focus:bg-rose-500/10">
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
