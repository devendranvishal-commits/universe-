"use client";

import { Sparkles } from "lucide-react";

type Props = {
  firstName: string;
  completionPercentage: number;
};

export default function ProfileHero({
  firstName,
  completionPercentage,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#10142b] via-[#131433] to-[#271257] p-7 md:p-9">
      <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-purple-500/20" />

      <div className="pointer-events-none absolute right-48 -top-28 h-64 w-64 rounded-full bg-indigo-500/15" />

      <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-purple-300">
            <Sparkles size={17} />
            Student profile
          </div>

          <h1 className="mt-3 text-3xl font-black md:text-4xl">
            Welcome, {firstName}.
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-gray-300">
            Complete your profile to help students
            recognize you and improve your Universe
            recommendations.
          </p>
        </div>

        <div className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 lg:max-w-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold">
                Profile strength
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {completionPercentage === 100
                  ? "Your profile is complete."
                  : "Add more details to improve it."}
              </p>
            </div>

            <span className="text-2xl font-black text-purple-300">
              {completionPercentage}%
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 transition-all duration-500"
              style={{
                width: `${completionPercentage}%`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}