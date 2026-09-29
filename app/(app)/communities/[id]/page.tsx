"use client";

import { useParams } from "next/navigation";
import CommunityHeader from "./components/CommunityHeader";
import CreatePost from "./components/CreatePost";
import PostList from "./components/PostList";

export default function CommunityDetailPage() {
  const params = useParams();
  const communityId = params.id as string;

  return (
    <main className="space-y-8">
      <CommunityHeader communityId={communityId} />

      <CreatePost communityId={communityId} />

      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h2 className="mb-6 text-3xl font-black">
          Community Feed
        </h2>

        <PostList communityId={communityId} />
      </section>
    </main>
  );
}