"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../../lib/client";

type Applicant = {
  id: string;
  created_at: string;
  profiles:
    | {
        full_name: string;
        university: string;
        major: string;
      }[]
    | null;
};

export default function GigApplicantsPage() {
  const params = useParams();
  const gigId = params.id as string;

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplicants();
  }, []);

  async function loadApplicants() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("gig_applications")
      .select(`
        id,
        created_at,
        profiles:applicant_id (
          full_name,
          university,
          major
        )
      `)
      .eq("gig_id", gigId)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
    } else {
      setApplicants((data as Applicant[]) || []);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <p className="p-10 text-center text-gray-400">
        Loading applicants...
      </p>
    );
  }

  return (
    <main className="space-y-8">
      <h1 className="text-5xl font-black">Applicants</h1>

      {applicants.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <h2 className="text-2xl font-bold">
            No applicants yet
          </h2>
        </div>
      ) : (
        <div className="space-y-5">
          {applicants.map((applicant) => {
            const profile = applicant.profiles?.[0];

            return (
              <div
                key={applicant.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <h2 className="text-2xl font-black">
                  {profile?.full_name || "Student"}
                </h2>

                <p className="mt-2 text-blue-400">
                  {profile?.university || "Unknown University"}
                </p>

                <p className="mt-2 text-gray-300">
                  {profile?.major || "Undeclared"}
                </p>

                <p className="mt-4 text-sm text-gray-500">
                  Applied on{" "}
                  {new Date(applicant.created_at).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}