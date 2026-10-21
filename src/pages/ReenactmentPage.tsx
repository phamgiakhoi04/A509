import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import LegacySidebar from "@/components/layout/LegacySidebar";
import ContentPageLayout, { ContentPageTitle } from "@/components/layout/ContentPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";

const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function ReenactmentPage() {
  const { language } = useLanguage();
  const [countries, setCountries] = useState<any[]>([]);
  useEffect(() => { adminApi.getAllCountries().then((data) => setCountries(data || [])).catch(() => setCountries([])); }, []);

  return <ContentPageLayout sidebar={<LegacySidebar />}>
    <div className="mb-7 bg-[#f1f1f1] px-3 py-2 text-[16px]">{language === "en" ? "Activities / Uniform reenactment" : "Hoạt động / Phục dựng trang phục"}</div>
    <ContentPageTitle>{language === "en" ? "Uniform reenactment" : "Phục dựng trang phục"}</ContentPageTitle>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{countries.map((country) => {
      const slug = slugify(country.countryName || "");
      return <Link key={country.id || slug} to={`/hoat-dong/phuc-dung/${slug}`} className="group bg-[#f1f1f1] p-4 text-center"><div className="mb-3 flex aspect-[4/3] items-center justify-center overflow-hidden bg-white">{country.flagImageUrl ? <img src={country.flagImageUrl} alt={country.countryName} className="h-full w-full object-cover" /> : <span className="text-6xl text-[#ddd]">▧</span>}</div><h2 className="font-display text-xl font-bold text-black group-hover:text-[#b51f24]">{country.countryName}</h2></Link>;
    })}</div>
    {!countries.length && <p className="py-16 text-center text-[#777]">{language === "en" ? "No countries have been configured for reenactment yet." : "Chưa có quốc gia phục dựng trong cơ sở dữ liệu."}</p>}
  </ContentPageLayout>;
}
