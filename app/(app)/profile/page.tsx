"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "../../../lib/client";
import ProfileHero from "./components/ProfileHero";
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileForm from "./components/ProfileForm";

type Profile = {
  id: string;
  full_name: string | null;
  university: string | null;
  major: string | null;
  graduation_year: string | number | null;
  country: string | null;
  bio: string | null;
  interests: string[] | null;
  avatar_url: string | null;
};

type ProfileStats = {
  posts: number;
  communities: number;
};

type Snapshot = {
  fullName: string;
  university: string;
  major: string;
  graduationYear: string;
  country: string;
  bio: string;
  interests: string[];
  avatarPath: string;
  selectedImageName: string;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [graduationYear, setGraduationYear] =
    useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<
    string[]
  >([]);

  const [avatarPath, setAvatarPath] =
    useState("");

  const [avatarDisplayUrl, setAvatarDisplayUrl] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [imageFailed, setImageFailed] =
    useState(false);

  const [message, setMessage] = useState("");

  const [stats, setStats] = useState<ProfileStats>({
    posts: 0,
    communities: 0,
  });

  const [
    initialProfileSnapshot,
    setInitialProfileSnapshot,
  ] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const currentSnapshot = useMemo(() => {
    const snapshot: Snapshot = {
      fullName,
      university,
      major,
      graduationYear,
      country,
      bio,
      interests: [...interests].sort(),
      avatarPath,
      selectedImageName:
        selectedImage?.name || "",
    };

    return JSON.stringify(snapshot);
  }, [
    fullName,
    university,
    major,
    graduationYear,
    country,
    bio,
    interests,
    avatarPath,
    selectedImage,
  ]);

  const hasUnsavedChanges =
    Boolean(initialProfileSnapshot) &&
    currentSnapshot !== initialProfileSnapshot;

  const completionPercentage = useMemo(() => {
    const completedFields = [
      Boolean(fullName.trim()),
      Boolean(university.trim()),
      Boolean(major.trim()),
      Boolean(graduationYear),
      Boolean(country.trim()),
      Boolean(bio.trim()),
      interests.length > 0,
      Boolean(
        avatarPath ||
          avatarDisplayUrl ||
          selectedImage
      ),
    ];

    const completedCount =
      completedFields.filter(Boolean).length;

    return Math.round(
      (completedCount / completedFields.length) *
        100
    );
  }, [
    fullName,
    university,
    major,
    graduationYear,
    country,
    bio,
    interests,
    avatarPath,
    avatarDisplayUrl,
    selectedImage,
  ]);

  async function createDisplayUrl(
    storedAvatarValue: string
  ) {
    if (!storedAvatarValue) {
      setAvatarDisplayUrl("");
      setImageFailed(false);
      return;
    }

    if (
      storedAvatarValue.startsWith("http://") ||
      storedAvatarValue.startsWith("https://")
    ) {
      setAvatarDisplayUrl(storedAvatarValue);
      setImageFailed(false);
      return;
    }

    const supabase = createClient();

    const { data, error } =
      await supabase.storage
        .from("profile-images")
        .createSignedUrl(
          storedAvatarValue,
          60 * 60 * 24 * 7
        );

    if (error) {
      console.error(
        "Could not create profile image URL:",
        error.message
      );

      setAvatarDisplayUrl("");
      setImageFailed(true);
      return;
    }

    setAvatarDisplayUrl(data.signedUrl);
    setImageFailed(false);
  }

  async function loadProfileStats(
    currentUserId: string
  ) {
    const supabase = createClient();

    const [postsResult, communitiesResult] =
      await Promise.all([
        supabase
          .from("posts")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("user_id", currentUserId),

        supabase
          .from("community_members")
          .select("community_id", {
            count: "exact",
            head: true,
          })
          .eq("user_id", currentUserId),
      ]);

    if (postsResult.error) {
      console.error(
        "Could not count posts:",
        postsResult.error.message
      );
    }

    if (communitiesResult.error) {
      console.error(
        "Could not count communities:",
        communitiesResult.error.message
      );
    }

    setStats({
      posts: postsResult.count || 0,
      communities:
        communitiesResult.count || 0,
    });
  }

  async function loadProfile() {
    setLoading(true);
    setMessage("");
    setImageFailed(false);

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setMessage(userError.message);
      setLoading(false);
      return;
    }

    if (!user) {
      setMessage(
        "Please log in to view your profile."
      );
      setLoading(false);
      return;
    }

    setUserId(user.id);
    setEmail(user.email || "");

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        university,
        major,
        graduation_year,
        country,
        bio,
        interests,
        avatar_url
      `)
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const profile = data as Profile | null;

    const loadedFullName =
      profile?.full_name || "";

    const loadedUniversity =
      profile?.university || "";

    const loadedMajor =
      profile?.major || "";

    const loadedGraduationYear =
      profile?.graduation_year
        ? String(profile.graduation_year)
        : "";

    const loadedCountry =
      profile?.country || "";

    const loadedBio = profile?.bio || "";

    const loadedInterests =
      profile?.interests || [];

    const loadedAvatarPath =
      profile?.avatar_url || "";

    setFullName(loadedFullName);
    setUniversity(loadedUniversity);
    setMajor(loadedMajor);
    setGraduationYear(
      loadedGraduationYear
    );
    setCountry(loadedCountry);
    setBio(loadedBio);
    setInterests(loadedInterests);
    setAvatarPath(loadedAvatarPath);

    await createDisplayUrl(
      loadedAvatarPath
    );

    const initialSnapshot: Snapshot = {
      fullName: loadedFullName,
      university: loadedUniversity,
      major: loadedMajor,
      graduationYear:
        loadedGraduationYear,
      country: loadedCountry,
      bio: loadedBio,
      interests: [
        ...loadedInterests,
      ].sort(),
      avatarPath: loadedAvatarPath,
      selectedImageName: "",
    };

    setInitialProfileSnapshot(
      JSON.stringify(initialSnapshot)
    );

    await loadProfileStats(user.id);

    setLoading(false);
  }

  function toggleInterest(item: string) {
    setInterests((current) =>
      current.includes(item)
        ? current.filter(
            (interest) => interest !== item
          )
        : [...current, item]
    );
  }

  function selectProfileImage(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage(
        "Please select a valid image file."
      );
      event.target.value = "";
      return;
    }

    const maximumSize =
      5 * 1024 * 1024;

    if (file.size > maximumSize) {
      setMessage(
        "Profile image must be smaller than 5 MB."
      );
      event.target.value = "";
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl =
      URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreview(previewUrl);
    setImageFailed(false);
    setMessage("");
  }

  async function uploadProfileImage() {
    if (!selectedImage || !userId) {
      return avatarPath;
    }

    setUploadingImage(true);

    const supabase = createClient();

    const originalExtension =
      selectedImage.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const safeExtension =
      originalExtension.replace(
        /[^a-z0-9]/g,
        ""
      ) || "jpg";

    const filePath =
      `${userId}/avatar-${Date.now()}.${safeExtension}`;

    const { error: uploadError } =
      await supabase.storage
        .from("profile-images")
        .upload(filePath, selectedImage, {
          cacheControl: "3600",
          upsert: false,
          contentType:
            selectedImage.type,
        });

    if (uploadError) {
      throw new Error(
        uploadError.message
      );
    }

    const { data, error: signedUrlError } =
      await supabase.storage
        .from("profile-images")
        .createSignedUrl(
          filePath,
          60 * 60 * 24 * 7
        );

    if (signedUrlError) {
      throw new Error(
        signedUrlError.message
      );
    }

    setAvatarDisplayUrl(data.signedUrl);
    setImageFailed(false);

    return filePath;
  }

  async function saveProfile() {
    if (!userId) {
      setMessage(
        "You must be logged in to save your profile."
      );
      return;
    }

    if (!fullName.trim()) {
      setMessage(
        "Please enter your full name."
      );
      return;
    }

    if (
      graduationYear &&
      (!/^\d{4}$/.test(
        graduationYear
      ) ||
        Number(graduationYear) < 2020 ||
        Number(graduationYear) > 2100)
    ) {
      setMessage(
        "Please enter a valid four-digit graduation year."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();

      const uploadedAvatarPath =
        await uploadProfileImage();

      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            full_name:
              fullName.trim(),
            university:
              university.trim() || null,
            major:
              major.trim() || null,
            graduation_year:
              graduationYear || null,
            country:
              country.trim() || null,
            bio: bio.trim() || null,
            interests,
            avatar_url:
              uploadedAvatarPath || null,
          },
          {
            onConflict: "id",
          }
        );

      if (error) {
        throw new Error(error.message);
      }

      setAvatarPath(
        uploadedAvatarPath || ""
      );

      setSelectedImage(null);

      if (
        imagePreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          imagePreview
        );
      }

      setImagePreview("");
      setImageFailed(false);

      if (uploadedAvatarPath) {
        await createDisplayUrl(
          uploadedAvatarPath
        );
      }

      const savedSnapshot: Snapshot = {
        fullName: fullName.trim(),
        university:
          university.trim(),
        major: major.trim(),
        graduationYear,
        country: country.trim(),
        bio: bio.trim(),
        interests: [
          ...interests,
        ].sort(),
        avatarPath:
          uploadedAvatarPath || "",
        selectedImageName: "",
      };

      setInitialProfileSnapshot(
        JSON.stringify(savedSnapshot)
      );

      setMessage(
        "Profile saved successfully!"
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save your profile."
      );
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  }

  const displayedImage =
    imagePreview || avatarDisplayUrl;

  const shouldShowImage =
    Boolean(displayedImage) &&
    !imageFailed;

  const initial =
    fullName
      .trim()
      .charAt(0)
      .toUpperCase() ||
    email
      .trim()
      .charAt(0)
      .toUpperCase() ||
    "U";

  const firstName =
    fullName
      .trim()
      .split(/\s+/)[0] ||
    "Student";

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-gray-400">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <main className="min-w-0 space-y-6 pb-8">
      <ProfileHero
        firstName={firstName}
        completionPercentage={
          completionPercentage
        }
      />

      {message && (
        <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 px-5 py-4 font-semibold text-purple-100">
          {message}
        </div>
      )}

      <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[340px_minmax(0,1fr)] 2xl:grid-cols-[390px_minmax(0,1fr)]">
        <ProfileSidebar
          fullName={fullName}
          email={email}
          university={university}
          major={major}
          country={country}
          graduationYear={
            graduationYear
          }
          displayedImage={
            displayedImage
          }
          shouldShowImage={
            shouldShowImage
          }
          initial={initial}
          stats={stats}
          onImageError={() =>
            setImageFailed(true)
          }
          onImageChange={
            selectProfileImage
          }
        />

        <ProfileForm
          fullName={fullName}
          university={university}
          major={major}
          graduationYear={
            graduationYear
          }
          country={country}
          bio={bio}
          interests={interests}
          saving={saving}
          uploadingImage={
            uploadingImage
          }
          hasUnsavedChanges={
            hasUnsavedChanges
          }
          onFullNameChange={
            setFullName
          }
          onUniversityChange={
            setUniversity
          }
          onMajorChange={setMajor}
          onGraduationYearChange={
            setGraduationYear
          }
          onCountryChange={setCountry}
          onBioChange={setBio}
          onToggleInterest={
            toggleInterest
          }
          onSave={saveProfile}
        />
      </div>
    </main>
  );
}