import { Bell, Lock, Palette, User } from "lucide-react";

const settings = [
  {
    title: "Account",
    detail: "Manage your name, university, and profile details.",
    icon: User,
  },
  {
    title: "Notifications",
    detail: "Control alerts for gigs, events, messages, and communities.",
    icon: Bell,
  },
  {
    title: "Privacy",
    detail: "Choose what other students can see on your profile.",
    icon: Lock,
  },
  {
    title: "Appearance",
    detail: "Customize how Universe looks and feels.",
    icon: Palette,
  },
];

export default function SettingsPage() {
  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-gray-700/30 to-purple-700/20 p-10">
        <p className="text-sm uppercase tracking-[0.3em] text-purple-300">
          Settings
        </p>

        <h1 className="mt-4 text-5xl font-black">Customize Universe.</h1>

        <p className="mt-4 max-w-2xl text-lg text-gray-300">
          Manage your account, privacy, notifications, and app preferences.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {settings.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
                <Icon size={26} />
              </div>

              <h2 className="text-2xl font-black">{item.title}</h2>
              <p className="mt-2 text-gray-400">{item.detail}</p>
            </div>
          );
        })}
      </section>
    </main>
  );
}