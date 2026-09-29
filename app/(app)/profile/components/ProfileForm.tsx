"use client";

import { User } from "lucide-react";
import InterestSelector from "./InterestSelector";
import SaveBar from "./SaveBar";

type Props = {
  fullName: string;
  university: string;
  major: string;
  graduationYear: string;
  country: string;
  bio: string;
  interests: string[];
  saving: boolean;
  uploadingImage: boolean;
  hasUnsavedChanges: boolean;
  onFullNameChange: (value: string) => void;
  onUniversityChange: (
    value: string
  ) => void;
  onMajorChange: (value: string) => void;
  onGraduationYearChange: (
    value: string
  ) => void;
  onCountryChange: (
    value: string
  ) => void;
  onBioChange: (value: string) => void;
  onToggleInterest: (
    interest: string
  ) => void;
  onSave: () => void;
};

export default function ProfileForm({
  fullName,
  university,
  major,
  graduationYear,
  country,
  bio,
  interests,
  saving,
  uploadingImage,
  hasUnsavedChanges,
  onFullNameChange,
  onUniversityChange,
  onMajorChange,
  onGraduationYearChange,
  onCountryChange,
  onBioChange,
  onToggleInterest,
  onSave,
}: Props) {
  return (
    <section className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[#101520] shadow-2xl shadow-black/20">
      <div className="p-6 md:p-8">
        <div className="border-b border-white/10 pb-6">
          <h2 className="text-3xl font-black">
            Profile information
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-gray-400">
            Keep your details accurate so other
            students can recognize and connect
            with you.
          </p>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <label className="min-w-0 space-y-2">
            <span className="text-sm font-bold text-gray-200">
              Full name
            </span>

            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-5 transition focus-within:border-purple-400/50">
              <User
                size={18}
                className="shrink-0 text-gray-500"
              />

              <input
                value={fullName}
                onChange={(event) =>
                  onFullNameChange(
                    event.target.value
                  )
                }
                placeholder="Full name"
                maxLength={100}
                className="min-w-0 flex-1 bg-transparent py-4 outline-none"
              />
            </div>
          </label>

          <Field
            label="University"
            value={university}
            placeholder="University"
            maxLength={150}
            onChange={onUniversityChange}
          />

          <Field
            label="Major"
            value={major}
            placeholder="Major"
            maxLength={120}
            onChange={onMajorChange}
          />

          <label className="min-w-0 space-y-2">
            <span className="text-sm font-bold text-gray-200">
              Graduation year
            </span>

            <input
              type="number"
              min="2020"
              max="2100"
              value={graduationYear}
              onChange={(event) =>
                onGraduationYearChange(
                  event.target.value
                )
              }
              placeholder="2028"
              className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none transition focus:border-purple-400/50"
            />
          </label>

          <div className="md:col-span-2">
            <Field
              label="Country"
              value={country}
              placeholder="Country"
              maxLength={100}
              onChange={onCountryChange}
            />
          </div>
        </div>

        <label className="mt-5 block space-y-2">
          <span className="text-sm font-bold text-gray-200">
            Bio
          </span>

          <textarea
            value={bio}
            onChange={(event) =>
              onBioChange(
                event.target.value
              )
            }
            placeholder="Tell students about yourself"
            maxLength={500}
            className="min-h-32 w-full resize-y rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none transition focus:border-purple-400/50"
          />

          <p className="text-right text-xs text-gray-500">
            {bio.length}/500
          </p>
        </label>

        <InterestSelector
          interests={interests}
          onToggle={onToggleInterest}
        />
      </div>

      <SaveBar
        saving={saving}
        uploadingImage={uploadingImage}
        hasUnsavedChanges={
          hasUnsavedChanges
        }
        onSave={onSave}
      />
    </section>
  );
}

type FieldProps = {
  label: string;
  value: string;
  placeholder: string;
  maxLength: number;
  onChange: (value: string) => void;
};

function Field({
  label,
  value,
  placeholder,
  maxLength,
  onChange,
}: FieldProps) {
  return (
    <label className="min-w-0 space-y-2">
      <span className="text-sm font-bold text-gray-200">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full min-w-0 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none transition focus:border-purple-400/50"
      />
    </label>
  );
}