"use client";

import {
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  Dumbbell,
  Gamepad2,
  HeartHandshake,
  Laptop,
  Music,
  Palette,
  Plane,
  Rocket,
  Trophy,
} from "lucide-react";
import { ReactNode } from "react";

const interestsList = [
  "Sports",
  "Music",
  "Startups",
  "AI",
  "Art",
  "Gigs",
  "Technology",
  "Business",
  "Gaming",
  "Fitness",
  "Travel",
  "Volunteering",
];

const interestIcons: Record<
  string,
  ReactNode
> = {
  Sports: <Trophy size={15} />,
  Music: <Music size={15} />,
  Startups: <Rocket size={15} />,
  AI: <BrainCircuit size={15} />,
  Art: <Palette size={15} />,
  Gigs: <BriefcaseBusiness size={15} />,
  Technology: <Laptop size={15} />,
  Business: <Building2 size={15} />,
  Gaming: <Gamepad2 size={15} />,
  Fitness: <Dumbbell size={15} />,
  Travel: <Plane size={15} />,
  Volunteering: (
    <HeartHandshake size={15} />
  ),
};

type Props = {
  interests: string[];
  onToggle: (interest: string) => void;
};

export default function InterestSelector({
  interests,
  onToggle,
}: Props) {
  return (
    <div className="mt-5">
      <p className="mb-3 font-bold text-gray-200">
        Interests
      </p>

      <div className="flex flex-wrap gap-2">
        {interestsList.map((item) => {
          const selected =
            interests.includes(item);

          return (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${
                selected
                  ? "border-purple-400 bg-purple-500/20 text-purple-100"
                  : "border-white/15 bg-transparent text-white hover:bg-white/5"
              }`}
            >
              {interestIcons[item]}
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}