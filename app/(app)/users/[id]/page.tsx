
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
BriefcaseBusiness,
Check,
GraduationCap,
LoaderCircle,
MapPin,
MessageCircle,
Sparkles,
University,
UserPlus,
UserRoundCheck,
} from "lucide-react";
import { createClient } from "../../../../lib/client";

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
followers: number;
following: number;
};

export default function PublicProfilePage() {
const params = useParams();
const router = useRouter();

const profileId = params.id as string;

const [profile, setProfile] =
useState<Profile | null>(null);

const [currentUserId, setCurrentUserId] =
useState("");

const [stats, setStats] =
useState<ProfileStats>({
posts: 0,
communities: 0,
followers: 0,
following: 0,
});

const [avatarDisplayUrl, setAvatarDisplayUrl] =
useState("");

const [imageFailed, setImageFailed] =
useState(false);

const [isFollowing, setIsFollowing] =
useState(false);

const [loading, setLoading] =
useState(true);

const [updatingFollow, setUpdatingFollow] =
useState(false);

const [openingMessage, setOpeningMessage] =
useState(false);

const [errorMessage, setErrorMessage] =
useState("");

useEffect(() => {
loadPage();
}, [profileId]);

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

async function loadStats() {
const supabase = createClient();

const [
postsResult,
communitiesResult,
followersResult,
followingResult,
] = await Promise.all([
supabase
.from("posts")
.select("id", {
count: "exact",
head: true,
})
.eq("user_id", profileId),

supabase
.from("community_members")
.select("community_id", {
count: "exact",
head: true,
})
.eq("user_id", profileId),

supabase
.from("user_follows")
.select("id", {
count: "exact",
head: true,
})
.eq("following_id", profileId),

supabase
.from("user_follows")
.select("id", {
count: "exact",
head: true,
})
.eq("follower_id", profileId),
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

if (followersResult.error) {
console.error(
"Could not count followers:",
followersResult.error.message
);
}

if (followingResult.error) {
console.error(
"Could not count following:",
followingResult.error.message
);
}

setStats({
posts: postsResult.count || 0,
communities:
communitiesResult.count || 0,
followers:
followersResult.count || 0,
following:
followingResult.count || 0,
});
}

async function loadFollowStatus(
loggedInUserId: string
) {
if (
!loggedInUserId ||
loggedInUserId === profileId
) {
setIsFollowing(false);
return;
}

const supabase = createClient();

const { data, error } = await supabase
.from("user_follows")
.select("id")
.eq("follower_id", loggedInUserId)
.eq("following_id", profileId)
.maybeSingle();

if (error) {
console.error(
"Could not load follow status:",
error.message
);

setIsFollowing(false);
return;
}

setIsFollowing(Boolean(data));
}

async function loadPage() {
setLoading(true);
setErrorMessage("");
setImageFailed(false);

if (!profileId) {
setProfile(null);
setErrorMessage(
"A student ID was not provided."
);
setLoading(false);
return;
}

const supabase = createClient();

const {
data: { user },
error: userError,
} = await supabase.auth.getUser();

if (userError) {
console.error(
"Could not load logged-in user:",
userError.message
);
}

const loggedInUserId = user?.id || "";

setCurrentUserId(loggedInUserId);

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
.eq("id", profileId)
.maybeSingle();

if (error) {
setProfile(null);
setErrorMessage(error.message);
setLoading(false);
return;
}

if (!data) {
setProfile(null);
setLoading(false);
return;
}

const loadedProfile = data as Profile;

setProfile(loadedProfile);

await Promise.all([
createDisplayUrl(
loadedProfile.avatar_url || ""
),
loadStats(),
loadFollowStatus(loggedInUserId),
]);

setLoading(false);
}

async function toggleFollow() {
if (!currentUserId) {
alert("Please log in to follow students.");
return;
}

if (currentUserId === profileId) {
return;
}

setUpdatingFollow(true);

const supabase = createClient();

if (isFollowing) {
const { error } = await supabase
.from("user_follows")
.delete()
.eq("follower_id", currentUserId)
.eq("following_id", profileId);

if (error) {
alert(error.message);
setUpdatingFollow(false);
return;
}

setIsFollowing(false);

setStats((current) => ({
...current,
followers: Math.max(
0,
current.followers - 1
),
}));
} else {
const { error } = await supabase
.from("user_follows")
.insert({
follower_id: currentUserId,
following_id: profileId,
});

if (error) {
if (error.code === "23505") {
setIsFollowing(true);
} else {
alert(error.message);
}

setUpdatingFollow(false);
return;
}

setIsFollowing(true);

setStats((current) => ({
...current,
followers:
current.followers + 1,
}));
}

setUpdatingFollow(false);
}

async function openConversation() {
if (!currentUserId) {
alert("Please log in to message students.");
return;
}

if (currentUserId === profileId) {
router.push("/messages");
return;
}

if (openingMessage) {
return;
}

setOpeningMessage(true);

const supabase = createClient();

const { data, error } = await supabase.rpc(
"get_or_create_direct_conversation",
{
other_user_id: profileId,
}
);

if (error) {
console.error(
"Could not open conversation:",
error
);

alert(error.message);
setOpeningMessage(false);
return;
}

const conversationId =
typeof data === "string"
? data
: Array.isArray(data) &&
typeof data[0] === "string"
? data[0]
: "";

if (!conversationId) {
alert(
"The conversation could not be created."
);

setOpeningMessage(false);
return;
}

router.push(`/messages/${conversationId}`);
}

if (loading) {
return (
<div className="flex min-h-[500px] items-center justify-center">
<div className="flex items-center gap-3 text-gray-400">
<LoaderCircle
className="animate-spin"
size={22}
/>

Loading student profile...
</div>
</div>
);
}

if (errorMessage) {
return (
<main className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 md:p-10">
<h1 className="text-3xl font-black text-red-200">
Could not load profile
</h1>

<p className="mt-3 text-red-200/80">
{errorMessage}
</p>
</main>
);
}

if (!profile) {
return (
<main className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
<h1 className="text-3xl font-black">
Student profile not found
</h1>

<p className="mt-3 text-gray-400">
This account may no longer exist or its
profile is unavailable.
</p>
</main>
);
}

const fullName =
profile.full_name?.trim() || "Student";

const firstName =
fullName.split(/\s+/)[0] || "Student";

const initial =
fullName.charAt(0).toUpperCase() || "S";

const showImage =
Boolean(avatarDisplayUrl) &&
!imageFailed;

const isOwnProfile =
Boolean(currentUserId) &&
currentUserId === profileId;

return (
<main className="min-w-0 space-y-6 pb-8">
<section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#10142b] via-[#131433] to-[#271257] p-7 md:p-9">
<div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-purple-500/20" />

<div className="pointer-events-none absolute right-48 -top-28 h-64 w-64 rounded-full bg-indigo-500/15" />

<div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
<div>
<div className="flex items-center gap-2 text-sm font-bold text-purple-300">
<Sparkles size={17} />
Student profile
</div>

<h1 className="mt-3 text-3xl font-black md:text-4xl">
Meet {firstName}.
</h1>

<p className="mt-3 max-w-2xl leading-7 text-gray-300">
Learn more about this student, their
interests, studies, and campus activity.
</p>
</div>

<div className="flex flex-wrap gap-3">
{isOwnProfile ? (
<Link
href="/profile"
className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-black text-black transition hover:bg-gray-200"
>
<UserRoundCheck size={19} />
Edit Profile
</Link>
) : (
<>
<button
onClick={toggleFollow}
disabled={updatingFollow}
className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
isFollowing
? "border border-purple-400/30 bg-purple-500/15 text-purple-100 hover:bg-purple-500/25"
: "bg-white text-black hover:bg-gray-200"
}`}
>
{updatingFollow ? (
<LoaderCircle
size={19}
className="animate-spin"
/>
) : isFollowing ? (
<Check size={19} />
) : (
<UserPlus size={19} />
)}

{updatingFollow
? "Updating..."
: isFollowing
? "Following"
: "Follow"}
</button>

<button
onClick={openConversation}
disabled={openingMessage}
className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
>
{openingMessage ? (
<LoaderCircle
size={19}
className="animate-spin"
/>
) : (
<MessageCircle size={19} />
)}

{openingMessage
? "Opening..."
: "Message"}
</button>
</>
)}
</div>
</div>
</section>

<div className="grid min-w-0 items-start gap-5 lg:grid-cols-[340px_minmax(0,1fr)] 2xl:grid-cols-[390px_minmax(0,1fr)]">
<aside className="h-fit min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[#101520] shadow-2xl shadow-black/20 lg:sticky lg:top-6">
<div className="h-32 bg-gradient-to-r from-purple-700 via-violet-600 to-blue-800" />

<div className="px-6 pb-7">
<div className="relative mx-auto -mt-20 h-40 w-40">
<div className="absolute inset-0 overflow-hidden rounded-full border-[5px] border-[#101520] bg-gradient-to-br from-purple-400 to-violet-700 shadow-2xl">
{showImage ? (
<img
src={avatarDisplayUrl}
alt={`${fullName} profile`}
onError={() =>
setImageFailed(true)
}
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
</div>

<div className="mt-5 text-center">
<h2 className="break-words text-2xl font-black">
{fullName}
</h2>

<p className="mt-2 text-sm text-purple-200">
{profile.major ||
"Major not provided"}
</p>

<p className="mt-1 text-sm text-gray-400">
{profile.university ||
"University not provided"}
</p>
</div>

<div className="mt-6 grid grid-cols-2 gap-3 border-y border-white/10 py-5 text-center">
<ProfileStat
value={stats.followers}
label="Followers"
/>

<ProfileStat
value={stats.following}
label="Following"
/>
</div>

<div className="mt-4 grid grid-cols-2 gap-3 text-center">
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
profile.university ||
"Not provided"
}
/>

<ProfileDetail
icon={
<GraduationCap size={21} />
}
label="Major"
value={
profile.major || "Not provided"
}
/>

<ProfileDetail
icon={<MapPin size={21} />}
label="Country"
value={
profile.country ||
"Not provided"
}
/>

<ProfileDetail
icon={
<BriefcaseBusiness size={21} />
}
label="Graduation year"
value={
profile.graduation_year
? String(
profile.graduation_year
)
: "Not provided"
}
/>
</div>
</div>
</aside>

<section className="min-w-0 rounded-3xl border border-white/10 bg-[#101520] p-6 shadow-2xl shadow-black/20 md:p-8">
<div className="border-b border-white/10 pb-6">
<h2 className="text-3xl font-black">
About {firstName}
</h2>

<p className="mt-3 max-w-2xl leading-7 text-gray-400">
Student information shared through
their Universe profile.
</p>
</div>

<div className="mt-7">
<h3 className="text-sm font-bold uppercase tracking-[0.15em] text-gray-500">
Bio
</h3>

<div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-5">
<p className="whitespace-pre-wrap break-words leading-8 text-gray-300">
{profile.bio ||
"This student has not added a bio yet."}
</p>
</div>
</div>

<div className="mt-7">
<h3 className="text-sm font-bold uppercase tracking-[0.15em] text-gray-500">
Interests
</h3>

{profile.interests &&
profile.interests.length > 0 ? (
<div className="mt-4 flex flex-wrap gap-2">
{profile.interests.map(
(interest) => (
<span
key={interest}
className="rounded-full border border-purple-400/30 bg-purple-500/15 px-4 py-2 text-sm font-bold text-purple-100"
>
{interest}
</span>
)
)}
</div>
) : (
<p className="mt-3 text-gray-500">
No interests have been added.
</p>
)}
</div>

<div className="mt-8 grid gap-4 sm:grid-cols-2">
<InfoCard
label="University"
value={
profile.university ||
"Not provided"
}
/>

<InfoCard
label="Major"
value={
profile.major || "Not provided"
}
/>

<InfoCard
label="Graduation year"
value={
profile.graduation_year
? String(
profile.graduation_year
)
: "Not provided"
}
/>

<InfoCard
label="Country"
value={
profile.country || "Not provided"
}
/>
</div>
</section>
</div>
</main>
);
}

type ProfileDetailProps = {
icon: React.ReactNode;
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

type InfoCardProps = {
label: string;
value: string;
};

function InfoCard({
label,
value,
}: InfoCardProps) {
return (
<div className="rounded-2xl border border-white/10 bg-black/20 p-5">
<p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
{label}
</p>

<p className="mt-2 break-words text-lg font-black">
{value}
</p>
</div>
);
}
