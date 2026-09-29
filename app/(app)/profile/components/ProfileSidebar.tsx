"use client";

import {
  BriefcaseBusiness,
  Camera,
  GraduationCap,
  MapPin,
  University,
} from "lucide-react";
import { ChangeEvent, ReactNode } from "react";

type Stats = {
  posts: number;
  communities: number;
};

type Props = {
  fullName: string;
  email: string;
  university: string;
  major: string;
  country: string;
  graduationYear: string;
  displayedImage: string;
  shouldShowImage: boolean;
  initial: string;
  stats: Stats;
  onImageError: () => void;
  onImageChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
};

export default function ProfileSidebar({
  fullName,
  email,
  university,
  major,
  country,
  graduationYear,
  displayedImage,
  shouldShowImage,
  initial,
  stats,
  onImageError,
  onImageChange,
}: Props) {
  return (
    <aside className="h-fit min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[#101520] shadow-2xl shadow-black/20 lg:sticky lg:top-6">
      <div className="h-32 bg-gradient-to-r from-purple-700 via-violet-600 to-blue-800" />

      <div className="px-6 pb-7">
        <div className="relative mx-auto -mt-20 h-40 w-40">
          <div className="absolute inset-0 overflow-hidden rounded-full border-[5px] border-[#101520] bg-gradient-to-br from-purple-400 to-violet-700 shadow-2xl">
            {shouldShowImage ? (
              <img
                src={displayedImage}
                alt={`${fullName || "Student"} profile`}
                onError={onImageError}
                className="absolute inset-0 block h-full w-full object-cover"
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
              <div className="flex h-full w-full items-center justify-center text-6xl font-black text-white">
                {initial}
              </div>
            )}
          </div>

          <label className="absolute bottom-1 right-0 z-20 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-4 border-[#101520] bg-white text-black shadow-xl transition hover:scale-105">
            <Camera size={20} />

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={onImageChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="mt-5 text-center">
          <h2 className="break-words text-2xl font-black">
            {fullName.trim() || "Your name"}
          </h2>

          <p className="mt-2 break-all text-sm text-gray-400">
            {email}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 border-y border-white/10 py-5 text-center">
          <ProfileStat
            value={stats.posts}
            label="Posts"
          />

          <ProfileStat
            value={stats.communities}
            label="Communities"
          />
        </div>

        <div className="mt-6 space-y-3">
          <ProfileDetail
            icon={<University size={21} />}
            label="University"
            value={
              university.trim() ||
              "Not provided"
            }
          />

          <ProfileDetail
            icon={<GraduationCap size={21} />}
            label="Major"
            value={
              major.trim() || "Not provided"
            }
          />

          <ProfileDetail
            icon={<MapPin size={21} />}
            label="Country"
            value={
              country.trim() || "Not provided"
            }
          />

          <ProfileDetail
            icon={
              <BriefcaseBusiness size={21} />
            }
            label="Graduation year"
            value={
              graduationYear || "Not provided"
            }
          />
        </div>
      </div>
    </aside>
  );
}

type ProfileDetailProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

function ProfileDetail({
  icon,
  label,
  value,
}: ProfileDetailProps) {
  return (
    <div className="flex min-w-0 items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mt-1 shrink-0 text-purple-300">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
          {label}
        </p>

        <p className="mt-1 break-words font-bold">
          {value}
        </p>
      </div>
    </div>
  );
}

type ProfileStatProps = {
  value: number;
  label: string;
};

function ProfileStat({
  value,
  label,
}: ProfileStatProps) {
  return (
    <div>
      <p className="text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </p>
    </div>
  );
}