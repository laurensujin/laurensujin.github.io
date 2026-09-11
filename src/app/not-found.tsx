import Link from "next/link";

/** 404 for URLs that match no route at all (rendered inside the root layout). */
export default function RootNotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[88rem] flex-col justify-center px-6 md:px-10">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 font-serif text-5xl font-light md:text-7xl">This page does not exist.</h1>
      <Link href="/" className="eyebrow link-line mt-10 inline-block w-fit text-fg">
        Back to the homepage
      </Link>
    </main>
  );
}
