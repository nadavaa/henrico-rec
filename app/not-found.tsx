import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">404</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Page not found</h1>
      <p className="mt-2 max-w-md text-slate-600">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-6 flex min-h-11 items-center rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
      >
        Back home
      </Link>
    </main>
  );
}
