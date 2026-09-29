"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  Car,
  Home,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { createClient } from "../../../lib/client";
import AppHeader from "../../../components/layout/AppHeader";

const quickActions = [
  {
    title: "Communities",
    icon: Users,
    href: "/communities",
    color: "from-purple-500 to-indigo-500",
  },
  {
    title: "Student Gigs",
    icon: BriefcaseBusiness,
    href: "/gigs",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Marketplace",
    icon: ShoppingBag,
    href: "/marketplace",
    color: "from-orange-500 to-yellow-500",
  },
  {
    title: "Housing",
    icon: Home,
    href: "/housing",
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "Events",
    icon: CalendarDays,
    href: "/events",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Carpool",
    icon: Car,
    href: "/carpool",
    color: "from-red-500 to-orange-500",
  },
];

const recommendations = [
  "🏈 Flag Football Tonight",
  "🎨 Design Club needs a Poster Designer",
  "🎉 AI Club Meetup at 7 PM",
  "🏠 Apartment available near campus",
];

export default function DashboardPage() {
  const [name, setName] = useState("Student");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (userError) {
        console.error(
          "Could not load dashboard user:",
          userError.message
        );
        return;
      }

      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) {
        return;
      }

      if (error) {
        console.error(
          "Could not load dashboard profile:",
          error.message
        );
        return;
      }

      if (data?.full_name?.trim()) {
        setName(data.full_name.trim());
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-w-0 space-y-8">
      <AppHeader />

      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-purple-700/30 to-blue-700/20 p-8 md:p-10">
        <p className="text-sm uppercase tracking-[0.3em] text-purple-300">
          Your Campus
        </p>

        <h1 className="mt-4 break-words text-4xl font-black md:text-5xl">
          Good Evening, {name} 👋
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-8 text-gray-300 md:text-lg">
          Your personalized student hub. Discover communities,
          earn money, explore events, and connect with your
          campus.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <span className="rounded-full bg-white/10 px-4 py-2">
            Sports
          </span>

          <span className="rounded-full bg-white/10 px-4 py-2">
            Music
          </span>

          <span className="rounded-full bg-white/10 px-4 py-2">
            Startups
          </span>

          <span className="rounded-full bg-white/10 px-4 py-2">
            Art
          </span>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <TrendingUp className="mb-4 text-green-400" />

          <h2 className="text-3xl font-black">128</h2>

          <p className="text-gray-400">
            Communities
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <BriefcaseBusiness className="mb-4 text-yellow-400" />

          <h2 className="text-3xl font-black">42</h2>

          <p className="text-gray-400">
            Student Gigs
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <ShoppingBag className="mb-4 text-purple-400" />

          <h2 className="text-3xl font-black">215</h2>

          <p className="text-gray-400">
            Marketplace Items
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <CalendarDays className="mb-4 text-cyan-400" />

          <h2 className="text-3xl font-black">18</h2>

          <p className="text-gray-400">
            Events Today
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-3xl font-black">
          Quick Access
        </h2>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:scale-[1.03] hover:border-purple-500"
              >
                <div
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r ${item.color}`}
                >
                  <Icon size={26} />
                </div>

                <h3 className="text-2xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-2 text-gray-400">
                  Open {item.title.toLowerCase()}.
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-3xl font-black">
          Recommended For You
        </h2>

        <div className="space-y-4">
          {recommendations.map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
            >
              <p className="text-xl font-semibold">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}