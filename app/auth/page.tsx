"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/client";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleAuth() {
    const supabase = createClient();

    if (!email || !password || (mode === "signup" && !fullName)) {
      alert("Please fill in all fields.");
      return;
    }

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        alert(error.message);
        return;
      }

      const userId = data.user?.id;

      if (userId) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: userId,
          full_name: fullName,
          university: "Ohio State University",
        });

        if (profileError) {
          alert(profileError.message);
          return;
        }
      }

      router.push("/dashboard");
    }

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      router.push("/dashboard");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050816] px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-10">
        <p className="text-sm uppercase tracking-[0.3em] text-purple-300">
          Universe
        </p>

        <h1 className="mt-4 text-4xl font-black">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>

        <p className="mt-3 text-gray-400">
          {mode === "signup"
            ? "Start your personalized student experience."
            : "Log back into your student hub."}
        </p>

        <div className="mt-8 space-y-4">
          {mode === "signup" && (
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-purple-500"
            />
          )}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="College email"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-purple-500"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-purple-500"
          />

          <button
            onClick={handleAuth}
            className="w-full rounded-2xl bg-white py-4 font-bold text-black transition hover:scale-[1.02]"
          >
            {mode === "signup" ? "Sign Up" : "Log In"}
          </button>
        </div>

        <button
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          className="mt-6 w-full text-center text-sm text-gray-400 hover:text-white"
        >
          {mode === "signup"
            ? "Already have an account? Log in"
            : "Need an account? Sign up"}
        </button>
      </div>
    </main>
  );
}