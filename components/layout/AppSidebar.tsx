"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  Car,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { createClient } from "../../lib/client";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
};

type SidebarProfile = {
  full_name: string | null;
  major: string | null;
  avatar_url: string | null;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    label: "Communities",
    href: "/communities",
    icon: Users,
  },
  {
    label: "Search",
    href: "/search",
    icon: Search,
  },
  {
    label: "Universe AI",
    href: "/ai",
    icon: Bot,
  },
  {
    label: "Student Gigs",
    href: "/gigs",
    icon: BriefcaseBusiness,
  },
  {
    label: "My Gigs",
    href: "/my-gigs",
    icon: BriefcaseBusiness,
  },
  {
    label: "Marketplace",
    href: "/marketplace",
    icon: ShoppingBag,
  },
  {
    label: "Favorites",
    href: "/favorites",
    icon: Heart,
  },
  {
    label: "Messages",
    href: "/messages",
    icon: MessageCircle,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    label: "Housing",
    href: "/housing",
    icon: Home,
  },
  {
    label: "Events",
    href: "/events",
    icon: CalendarDays,
  },
  {
    label: "My Events",
    href: "/my-events",
    icon: CalendarDays,
  },
  {
    label: "Carpool",
    href: "/carpool",
    icon: Car,
  },
  {
    label: "My Rides",
    href: "/my-rides",
    icon: Car,
  },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState("");
  const [unreadNotifications, setUnreadNotifications] =
    useState(0);

  const [profileName, setProfileName] =
    useState("Student");

  const [profileSubtitle, setProfileSubtitle] =
    useState("Universe member");

  const [profileAvatarUrl, setProfileAvatarUrl] =
    useState("");

  const [profileImageFailed, setProfileImageFailed] =
    useState(false);

  useEffect(() => {
    const supabase = createClient();

    let mounted = true;

    let notificationChannel:
      | ReturnType<typeof supabase.channel>
      | undefined;

    async function initializeSidebar() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (userError) {
        console.error(
          "Could not load sidebar user:",
          userError.message
        );

        setUnreadNotifications(0);
        return;
      }

      if (!user) {
        setCurrentUserId("");
        setUnreadNotifications(0);
        setProfileName("Student");
        setProfileSubtitle("Universe member");
        setProfileAvatarUrl("");
        return;
      }

      setCurrentUserId(user.id);

      await Promise.all([
        loadUnreadNotifications(user.id),
        loadSidebarProfile(user.id),
      ]);

      if (!mounted) {
        return;
      }

      const channel = supabase
        .channel(
          `sidebar-notifications-${user.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `recipient_id=eq.${user.id}`,
          },
          async () => {
            if (!mounted) {
              return;
            }

            await loadUnreadNotifications(user.id);
          }
        )
        .subscribe((status, error) => {
          if (error) {
            console.error(
              "Sidebar notification realtime error:",
              error
            );
          }

          if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT"
          ) {
            console.warn(
              "Sidebar notification realtime disconnected."
            );
          }
        });

      notificationChannel = channel;
    }

    initializeSidebar();

    return () => {
      mounted = false;

      if (notificationChannel) {
        supabase.removeChannel(
          notificationChannel
        );
      }
    };
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    loadUnreadNotifications(currentUserId);
  }, [pathname, currentUserId]);

  async function createAvatarDisplayUrl(
    avatarValue: string
  ) {
    if (!avatarValue) {
      return "";
    }

    if (
      avatarValue.startsWith("http://") ||
      avatarValue.startsWith("https://")
    ) {
      return avatarValue;
    }

    const supabase = createClient();

    const { data, error } =
      await supabase.storage
        .from("profile-images")
        .createSignedUrl(
          avatarValue,
          60 * 60 * 24 * 7
        );

    if (error) {
      console.error(
        "Could not load sidebar profile image:",
        error.message
      );

      return "";
    }

    return data.signedUrl;
  }

  async function loadSidebarProfile(
    userId: string
  ) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        full_name,
        major,
        avatar_url
      `)
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error(
        "Could not load sidebar profile:",
        error.message
      );

      return;
    }

    const profile =
      data as SidebarProfile | null;

    const loadedName =
      profile?.full_name?.trim() || "Student";

    const loadedSubtitle =
      profile?.major?.trim() ||
      "Universe member";

    const avatarUrl =
      await createAvatarDisplayUrl(
        profile?.avatar_url || ""
      );

    setProfileName(loadedName);
    setProfileSubtitle(loadedSubtitle);
    setProfileAvatarUrl(avatarUrl);
    setProfileImageFailed(false);
  }

  async function loadUnreadNotifications(
    userId: string
  ) {
    const supabase = createClient();

    const { count, error } = await supabase
      .from("notifications")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("recipient_id", userId)
      .eq("is_read", false);

    if (error) {
      console.warn(
        "Could not load notification count:",
        error.message || error
      );

      setUnreadNotifications(0);
      return;
    }

    setUnreadNotifications(count || 0);
  }

  async function handleLogout() {
    const supabase = createClient();

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/auth");
    router.refresh();
  }

  function isActive(href: string) {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  const profileInitial =
    profileName
      .trim()
      .charAt(0)
      .toUpperCase() || "S";

  const showProfileImage =
    Boolean(profileAvatarUrl) &&
    !profileImageFailed;

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-80 overflow-y-auto border-r border-white/10 bg-[#050816] px-5 py-6 text-white lg:flex lg:flex-col">
      <Link
        href="/dashboard"
        className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.06] p-4 transition hover:bg-white/[0.09]"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
          <Sparkles size={20} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-lg font-black leading-none">
            Universe
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Student OS
          </p>
        </div>
      </Link>

      <nav className="mt-8 flex-1 space-y-1">
        <p className="mb-3 px-4 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
          Main Menu
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          const isNotifications =
            item.href === "/notifications";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${
                active
                  ? "bg-white text-black"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <Icon
                  size={18}
                  className="shrink-0"
                />

                <span className="truncate">
                  {item.label}
                </span>
              </div>

              {isNotifications &&
                unreadNotifications > 0 && (
                  <span
                    className={`ml-3 flex min-w-6 shrink-0 items-center justify-center rounded-full px-2 py-0.5 text-xs font-black ${
                      active
                        ? "bg-red-600 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {unreadNotifications > 99
                      ? "99+"
                      : unreadNotifications}
                  </span>
                )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 space-y-2 border-t border-white/10 pt-4">
        <Link
          href="/settings"
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
            isActive("/settings")
              ? "bg-white text-black"
              : "text-gray-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-gray-300 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>

        <Link
          href="/profile"
          className="mt-4 block rounded-3xl border border-white/10 bg-white/[0.06] p-4 transition hover:bg-white/[0.09]"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 ring-2 ring-white/10">
              {showProfileImage ? (
                <img
                  src={profileAvatarUrl}
                  alt=""
                  onError={() =>
                    setProfileImageFailed(true)
                  }
                  className="block h-full w-full object-cover"
                  style={{
                    width: "100%",
                    height: "100%",
                    minWidth: "100%",
                    minHeight: "100%",
                    maxWidth: "none",
                    maxHeight: "none",
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-black text-white">
                  {profileInitial}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate font-black">
                {profileName}
              </p>

              <p className="truncate text-xs text-gray-400">
                {profileSubtitle}
              </p>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}