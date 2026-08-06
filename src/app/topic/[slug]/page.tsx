import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { topicFromSlug, getTopics } from "@/lib/topics";
import { getVideos } from "@/lib/store";
import { VideoGrid } from "@/components/VideoGrid";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = topicFromSlug(slug);
  return { title: topic?.label || "Topic" };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = topicFromSlug(slug);
  if (!topic) notFound();

  const { videos } = await getVideos({ query: topic.query, limit: 48 });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-red-400">Topic</p>
        <h1 className="text-3xl font-bold text-white">{topic.label}</h1>
        <p className="mt-1 text-zinc-400">Videos matching “{topic.query}”</p>
      </div>
      {videos.length === 0 ? (
        <p className="text-zinc-500">
          No catalog matches yet. Run discovery with this niche keyword, or search above.
        </p>
      ) : (
        <VideoGrid videos={videos} />
      )}
      {getTopics().length === 0 && null}
    </div>
  );
}
