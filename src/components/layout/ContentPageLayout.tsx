import type { PropsWithChildren, ReactNode } from "react";

/** Shared frame for public content pages, so padding and sidebar behavior stay consistent. */
export default function ContentPageLayout({
  children,
  sidebar,
  className = "",
}: PropsWithChildren<{ sidebar?: ReactNode; className?: string }>) {
  return (
    <div
      className={`bg-white px-5 py-6 font-body text-[#2B2927] md:px-10 ${
        sidebar ? "grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_240px]" : ""
      } ${className}`}
    >
      {sidebar ? (
        <>
          <main className="min-w-0">{children}</main>
          {sidebar}
        </>
      ) : (
        children
      )}
    </div>
  );
}

export function ContentPageTitle({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return (
    <h1
      className={`mb-5 border-b-2 border-brand-red pb-3 font-display text-2xl font-black uppercase text-brand-redDark sm:text-3xl ${className}`}
    >
      {children}
    </h1>
  );
}
