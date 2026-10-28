import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import ContentPageLayout, {
  ContentPageTitle,
} from "@/components/layout/ContentPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import ContentPageHeading from "@/components/layout/ContentPageHeading";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function ReenactmentPage() {
  const { language } = useLanguage();
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    adminApi
      .getAllCountries()
      .then((data) => {
        if (active) setCountries(data || []);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <ContentPageLayout>
      <ContentPageHeading
        title={
          language === "en" ? "Uniform reenactment" : "Phục dựng trang phục"
        }
        trail={
          language === "en"
            ? "Activities / Uniform reenactment"
            : "Hoạt động / Phục dựng trang phục"
        }
      />
      {loading && (
        <p role="status" className="py-10">
          {language === "en" ? "Loading..." : "Đang tải..."}
        </p>
      )}
      {error && (
        <p role="alert" className="py-10 text-red-700">
          {language === "en"
            ? "Could not load countries. Please reload the page."
            : "Không tải được danh sách quốc gia. Vui lòng tải lại trang."}
        </p>
      )}
      <ul className="divide-y border-y border-gray-200">
        {countries.map((country) => (
          <li key={country.id}>
            <Link
              to={`/hoat-dong/phuc-dung/${slugify(country.sourceName || country.countryName || "")}`}
              className="flex justify-between py-5 font-display text-xl font-bold hover:text-brand-red"
            >
              {country.countryName}
              <span aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
      {!loading && !error && !countries.length && (
        <p className="py-16 text-center text-[#777]">
          {language === "en"
            ? "No countries have been configured for reenactment yet."
            : "Chưa có quốc gia phục dựng trong cơ sở dữ liệu."}
        </p>
      )}
    </ContentPageLayout>
  );
}
