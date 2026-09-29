"use client";

import ApplyButton from "./ApplyButton";

type Props = {
  id: string;
  title: string;
  description: string;
  pay: number;
  location: string;
  deadline: string;
};

export default function GigCard({
  id,
  title,
  description,
  pay,
  location,
  deadline,
}: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-300">
        Campus Gig
      </p>

      <h3 className="mt-3 text-2xl font-black">{title}</h3>

      <p className="mt-4 text-gray-300">{description}</p>

      <div className="mt-6 grid gap-2 text-sm text-gray-300">
        <p>
          Pay: <span className="font-bold text-green-400">${pay}</span>
        </p>

        <p>
          Location: {location || "Campus"}
        </p>

        <p>
          Deadline: {deadline || "Flexible"}
        </p>
      </div>

      <ApplyButton gigId={id} />
    </div>
  );
}