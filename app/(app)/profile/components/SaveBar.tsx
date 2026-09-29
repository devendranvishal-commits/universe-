"use client";

import {
  LoaderCircle,
  Save,
} from "lucide-react";

type Props = {
  saving: boolean;
  uploadingImage: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
};

export default function SaveBar({
  saving,
  uploadingImage,
  hasUnsavedChanges,
  onSave,
}: Props) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-white/10 bg-[#101520]/95 p-5 backdrop-blur-xl md:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          {hasUnsavedChanges ? (
            <p className="font-semibold text-amber-300">
              You have unsaved changes.
            </p>
          ) : (
            <p className="text-gray-500">
              Your latest changes are saved.
            </p>
          )}
        </div>

        <button
          onClick={onSave}
          disabled={
            saving || uploadingImage
          }
          className="inline-flex min-w-48 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 px-6 py-3.5 font-black text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving || uploadingImage ? (
            <LoaderCircle
              className="animate-spin"
              size={20}
            />
          ) : (
            <Save size={20} />
          )}

          {uploadingImage
            ? "Uploading image..."
            : saving
              ? "Saving profile..."
              : "Save Profile"}
        </button>
      </div>
    </div>
  );
}