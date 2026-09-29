"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  DollarSign,
  LoaderCircle,
  MapPin,
  User,
} from "lucide-react";
import { createClient } from "../../../../lib/client";

type Gig = {
  id: string;
  title: string;
  description: string | null;
  pay: number | null;
  location: string | null;
  deadline: string | null;
  owner_id: string | null;
  created_at: string;
};

type OwnerProfile = {
  id: string;
  full_name: string | null;
  university: string | null;
  major: string | null;
};

export default function GigDetailPage() {
  const params = useParams();
  const gigId = params.id as string;

  const [gig, setGig] = useState<Gig | null>(null);
  const [owner, setOwner] = useState<OwnerProfile | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadGig();
  }, [gigId]);

  async function loadGig() {
    setLoading(true);
    setErrorMessage("");

    if (!gigId) {
      setErrorMessage("A gig ID was not provided.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("student_gigs")
      .select(`
        id,
        title,
        description,
        pay,
        location,
        deadline,
        owner_id,
        created_at
      `)
      .eq("id", gigId)
      .maybeSingle();

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    if (!data) {
      setGig(null);
      setLoading(false);
      return;
    }

    const loadedGig = data as Gig;
    setGig(loadedGig);

    if (loadedGig.owner_id) {
      const { data: ownerData, error: ownerError } =
        await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            university,
            major
          `)
          .eq("id", loadedGig.owner_id)
          .maybeSingle();

      if (ownerError) {
        console.error(
          "Could not load gig owner:",
          ownerError.message
        );
      } else if (ownerData) {
        setOwner(ownerData as OwnerProfile);
      }
    }

    setLoading(false);
  }

  function formatDate(value: string | null) {
    if (!value) {
      return "Not specified";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not specified";
    }

    return date.toLocaleDateString([], {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <LoaderCircle
            size={22}
            className="animate-spin"
          />

          Loading gig...
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <main className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8">
        <h1 className="text-3xl font-black text-red-200">
          Could not load gig
        </h1>

        <p className="mt-3 text-red-200/80">
          {errorMessage}
        </p>

        <Link
          href="/gigs"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-black"
        >
          <ArrowLeft size={18} />
          Back to gigs
        </Link>
      </main>
    );
  }

  if (!gig) {
    return (
      <main className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-black">
          Gig not found
        </h1>

        <p className="mt-3 text-gray-400">
          This gig may have been removed or is no longer
          available.
        </p>

        <Link
          href="/gigs"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-black"
        >
          <ArrowLeft size={18} />
          Back to gigs
        </Link>
      </main>
    );
  }

  return (
    <main className="min-w-0 space-y-6">
      <Link
        href="/gigs"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 transition hover:text-white"
      >
        <ArrowLeft size={18} />
        Back to gigs
      </Link>

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#11152d] via-[#16143a] to-[#32156d] p-7 md:p-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-purple-500/20" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-sm font-bold text-purple-300">
            <BriefcaseBusiness size={18} />
            Student Gig
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-black md:text-5xl">
            {gig.title}
          </h1>

          <p className="mt-4 text-gray-300">
            Posted {formatDate(gig.created_at)}
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-3xl border border-white/10 bg-[#101520] p-6 md:p-8">
          <h2 className="text-3xl font-black">
            Gig details
          </h2>

          <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="whitespace-pre-wrap break-words leading-8 text-gray-300">
              {gig.description ||
                "No description was provided."}
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <DetailCard
            icon={<DollarSign size={21} />}
            label="Pay"
            value={
              gig.pay != null
                ? `$${gig.pay}`
                : "Not specified"
            }
          />

          <DetailCard
            icon={<MapPin size={21} />}
            label="Location"
            value={gig.location || "Not specified"}
          />

          <DetailCard
            icon={<CalendarDays size={21} />}
            label="Deadline"
            value={formatDate(gig.deadline)}
          />

          <DetailCard
            icon={<User size={21} />}
            label="Posted by"
            value={
              owner?.full_name?.trim() ||
              "Universe student"
            }
            subtitle={
              [owner?.major, owner?.university]
                .filter(Boolean)
                .join(" • ") || undefined
            }
          />
        </aside>
      </div>
    </main>
  );
}

type DetailCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
};

function DetailCard({
  icon,
  label,
  value,
  subtitle,
}: DetailCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#101520] p-5">
      <div className="flex items-start gap-4">
        <div className="mt-1 shrink-0 text-purple-300">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-500">
            {label}
          </p>

          <p className="mt-2 break-words text-lg font-black">
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 break-words text-sm text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}