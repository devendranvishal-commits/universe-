"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/client";

type Props = {
  gigId: string;
};

export default function ApplyButton({ gigId }: Props) {
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkApplication();
  }, []);

  async function checkApplication() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("gig_applications")
      .select("id")
      .eq("gig_id", gigId)
      .eq("applicant_id", user.id)
      .maybeSingle();

    setApplied(!!data);
  }

  async function applyToGig() {
    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in.");
      setLoading(false);
      return;
    }

    if (applied) {
      const { error } = await supabase
        .from("gig_applications")
        .delete()
        .eq("gig_id", gigId)
        .eq("applicant_id", user.id);

      if (error) alert(error.message);
      else setApplied(false);
    } else {
      const { error } = await supabase.from("gig_applications").insert({
        gig_id: gigId,
        applicant_id: user.id,
      });

      if (error) alert(error.message);
      else setApplied(true);
    }

    setLoading(false);
  }

  return (
    <button
      onClick={applyToGig}
      disabled={loading}
      className={`mt-6 rounded-2xl px-6 py-3 font-bold ${
        applied ? "bg-green-500 text-white" : "bg-white text-black"
      }`}
    >
      {applied ? "Applied" : "Apply"}
    </button>
  );
}