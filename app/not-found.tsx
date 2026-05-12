import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[rgb(249,251,250)] px-5 text-center text-slate-900">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
          BSVgo
        </p>
        <h1 className="mt-5 text-5xl font-black">Page not found</h1>
        <p className="mt-4 text-slate-600">
          The article or topic you requested is not available.
        </p>
        <Link
          href="/en"
          className="mt-8 inline-flex rounded-md bg-emerald-200 px-5 py-3 font-semibold text-slate-900"
        >
          Back to BSVgo
        </Link>
      </div>
    </main>
  );
}
