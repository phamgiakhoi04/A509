import type { ReactNode } from "react";
import { ContentPageTitle } from "./ContentPageLayout";

export default function ContentPageHeading({ title, trail }: { title: ReactNode; trail?: ReactNode }) {
  return <header className="mb-6 min-w-0">
    <ContentPageTitle>{title}</ContentPageTitle>
    {trail && <div className="-mt-2 bg-[#f1f1f1] px-3 py-2 text-sm leading-6 text-[#555]" aria-label="Đường dẫn nội dung">{trail}</div>}
  </header>;
}
