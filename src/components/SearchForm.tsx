import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
export default function SearchForm({
  initialQuery = "",
  type = "all",
}: {
  initialQuery?: string;
  type?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();
  const { language } = useLanguage();
  function submit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (type !== "all") params.set("type", type);
    navigate(`/tim-kiem?${params}`);
  }
  return (
    <form
      role="search"
      onSubmit={submit}
      className="flex border border-gray-300 bg-white focus-within:border-brand-red"
    >
      <input
        maxLength={120}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label={
          language === "en" ? "Search the site" : "Tra cứu toàn website"
        }
        placeholder={language === "en" ? "Search..." : "Tra cứu..."}
        className="min-w-0 flex-1 px-3 py-2 outline-none"
      />
      <button type="submit" className="bg-brand-red px-4 font-bold text-white">
        {language === "en" ? "Search" : "Tìm"}
      </button>
    </form>
  );
}
