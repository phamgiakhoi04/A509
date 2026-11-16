import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  backTo?: string;
  level?: 1 | 2;
};

export default function AdminPageHeader({ title, description, actions, backTo, level = 1 }: Props) {
  return (
    <header className="border-b-2 border-brand-red/20 pb-4">
      {backTo && (
        <Link
          to={backTo}
          className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-redDark transition-colors hover:text-brand-red hover:underline"
        >
          <ArrowLeft aria-hidden="true" size={18} />
          Quay lại danh sách
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          {level === 1 ? (
            <h1 className="break-words font-display text-2xl font-black leading-tight text-brand-redDark sm:text-3xl xl:text-4xl">
              {title}
            </h1>
          ) : (
            <h2 className="break-words font-display text-xl font-black leading-tight text-brand-redDark sm:text-2xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">{description}</p>
          )}
        </div>
        {actions && <div className="flex max-w-full flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}
