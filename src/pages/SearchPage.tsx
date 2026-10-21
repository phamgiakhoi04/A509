import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { adminApi } from "@/api/adminApi";
import { articleApi } from "@/api/articleApi";
import type { ArticleDTO } from "@/types/models";

type SearchResult = {
  key: string;
  type: string;
  title: string;
  description: string;
  href: string;
};

const slugify = (value: string) => value
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/đ/g, "d")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const normalize = (value: unknown) => String(value ?? "")
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/đ/g, "d");

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = (params.get("q") || "").trim();
  const [input, setInput] = useState(query);
  const [articles, setArticles] = useState<ArticleDTO[]>([]);
  const [uniforms, setUniforms] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [reenactmentRoots, setReenactmentRoots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => setInput(query), [query]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      articleApi.getPublished(),
      adminApi.getAllUniforms(),
      adminApi.getAllCountries(),
      adminApi.getRootCategoriesByType("REENACTMENT"),
    ]).then(([articleResult, uniformResult, countryResult, categoryResult]) => {
      if (!active) return;
      setArticles(articleResult.status === "fulfilled" && Array.isArray(articleResult.value) ? articleResult.value : []);
      setUniforms(uniformResult.status === "fulfilled" && Array.isArray(uniformResult.value) ? uniformResult.value : []);
      setCountries(countryResult.status === "fulfilled" && Array.isArray(countryResult.value) ? countryResult.value : []);
      setReenactmentRoots(categoryResult.status === "fulfilled" && Array.isArray(categoryResult.value) ? categoryResult.value : []);
      setLoadError([articleResult, uniformResult, countryResult, categoryResult].every((result) => result.status === "rejected"));
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, []);

  const results = useMemo(() => {
    if (!query) return [];
    const needle = normalize(query);
    const found: SearchResult[] = [];
    const matches = (...values: unknown[]) => values.some((value) => normalize(value).includes(needle));

    articles.forEach((article) => {
      if (matches(article.title, article.excerpt, article.content)) {
        found.push({
          key: `article-${article.id ?? article.slug}`,
          type: "Bài viết",
          title: article.title,
          description: article.excerpt || "Bài viết trong thư viện A509.",
          href: `/tin-tuc/${article.slug}`,
        });
      }
    });

    uniforms.forEach((uniform) => {
      if (matches(uniform.name, uniform.description, uniform.history, uniform.period, uniform.country?.countryName, uniform.category?.categoryName)) {
        found.push({
          key: `uniform-${uniform.id}`,
          type: uniform.category?.categoryType === "REENACTMENT" ? "Phục dựng" : "Quân trang",
          title: uniform.name,
          description: [uniform.country?.countryName, uniform.category?.categoryName, uniform.period, uniform.description].filter(Boolean).join(" · "),
          href: `/tai-lieu/quan-trang/${uniform.id}`,
        });
      }
    });

    countries.forEach((country) => {
      if (matches(country.countryName, country.continent)) {
        found.push({
          key: `country-${country.id}`,
          type: "Quốc gia",
          title: country.countryName,
          description: country.continent || "Quốc gia trong mục phục dựng.",
          href: `/hoat-dong/phuc-dung/${slugify(country.countryName || "")}`,
        });
      }
    });

    const reenactmentRoot = reenactmentRoots.find((item) => slugify(item.categoryName || "") === "phuc-dung-trang-phuc") || reenactmentRoots[0];
    (reenactmentRoot?.children || []).forEach((force: any) => {
      const country = countries.find((item) => Number(item.id) === Number(force.countryId));
      if (!country) return;
      const countryPath = `/hoat-dong/phuc-dung/${slugify(country.countryName || "")}`;
      const forceSlug = slugify(force.categoryName || "");
      const forcePath = `${countryPath}/${forceSlug}`;
      if (matches(force.categoryName, country.countryName)) {
        found.push({
          key: `force-${force.id}`,
          type: "Lực lượng",
          title: force.categoryName,
          description: `Phục dựng · ${country.countryName}`,
          href: forcePath,
        });
      }
      (force.children || []).forEach((period: any) => {
        if (!matches(period.categoryName, period.slug, force.categoryName, country.countryName)) return;
        found.push({
          key: `period-${period.id}`,
          type: "Thời kỳ",
          title: period.categoryName,
          description: `${force.categoryName} · ${country.countryName}`,
          href: `${forcePath}/${period.slug || slugify(period.categoryName || "")}`,
        });
      });
    });

    return found;
  }, [articles, countries, query, reenactmentRoots, uniforms]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = input.trim();
    if (next) setParams({ q: next });
    else setParams({});
  };

  return (
    <section className="mx-auto min-h-[55vh] max-w-5xl bg-white px-5 py-8 md:px-10 md:py-10">
      <h1 className="font-display text-3xl font-black uppercase text-brand-redDark">Tra cứu</h1>
      <p className="mt-2 text-sm text-gray-600">Tìm trong bài viết, quân trang, quốc gia, lực lượng và thời kỳ phục dựng.</p>

      <form onSubmit={submitSearch} className="mt-6 flex border border-gray-300 focus-within:border-brand-red">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Nhập tên, từ khóa hoặc nội dung..."
          aria-label="Từ khóa tra cứu"
          className="min-w-0 flex-1 px-4 py-3 outline-none"
        />
        <button type="submit" aria-label="Tìm kiếm" className="flex items-center gap-2 bg-brand-red px-5 font-bold text-white hover:bg-brand-redDark">
          <Search size={18} />
          Tìm
        </button>
      </form>

      {!query ? (
        <p className="py-16 text-center text-gray-500">Nhập từ khóa để tra cứu nội dung trên trang.</p>
      ) : loading ? (
        <p className="py-16 text-center text-gray-500">Đang tra cứu...</p>
      ) : loadError ? (
        <p className="py-16 text-center text-red-700">Không tải được dữ liệu tra cứu. Vui lòng tải lại trang.</p>
      ) : results.length === 0 ? (
        <p className="py-16 text-center text-gray-500">Không tìm thấy kết quả cho “{query}”.</p>
      ) : (
        <>
          <p className="mt-6 text-sm text-gray-500">Tìm thấy {results.length} kết quả</p>
          <div className="mt-2 divide-y divide-gray-200 border-y border-gray-200">
            {results.map((result) => (
              <Link key={result.key} to={result.href} className="block py-4 hover:text-brand-red">
                <span className="text-xs font-bold uppercase tracking-wide text-brand-red">{result.type}</span>
                <h2 className="mt-1 font-display text-xl font-bold">{result.title}</h2>
                {result.description && <p className="mt-1 line-clamp-2 text-sm text-gray-600">{result.description}</p>}
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
