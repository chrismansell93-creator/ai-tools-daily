import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-bold text-white">Not found</h1>
      <p className="mt-2 text-zinc-400">That page or video is not in the catalog.</p>
      <Link href="/" className="mt-6 inline-block rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500">
        Back home
      </Link>
    </div>
  );
}
