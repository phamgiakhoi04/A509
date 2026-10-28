import { useLanguage } from "@/contexts/LanguageContext";
export default function TranslationNotice({ status }: { status?: string }) {
  const { language } = useLanguage();
  if (language !== "en" || status === "complete") return null;
  return (
    <p className="my-4 border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
      An English translation is being prepared. Some content is shown in the
      original Vietnamese.
    </p>
  );
}
