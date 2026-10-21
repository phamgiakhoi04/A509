import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { adminApi } from "@/api/adminApi";
import LegacySidebar from "@/components/layout/LegacySidebar";
import SensitiveImage from "@/components/SensitiveImage";

const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function ReenactmentHierarchyPage() {
  const { countrySlug, unitSlug, periodSlug } = useParams();
  const [countries, setCountries] = useState<any[]>([]);
  const [uniforms, setUniforms] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    const loadHierarchy = async () => {
      const [countryResult, categoryResult, uniformResult] = await Promise.allSettled([
        adminApi.getAllCountries(),
        adminApi.getRootCategoriesByType("REENACTMENT"),
        periodSlug ? adminApi.getAllUniforms() : Promise.resolve([]),
      ]);

      if (!active) return;
      const countryData = countryResult.status === "fulfilled" ? countryResult.value : [];
      const categoryData = categoryResult.status === "fulfilled" ? categoryResult.value : [];
      const uniformData = uniformResult.status === "fulfilled" ? uniformResult.value : [];

      setCountries(countryData || []);
      const root = (categoryData || []).find((item: any) => slugify(item.categoryName || "") === "phuc-dung-trang-phuc") || (categoryData || [])[0];
      const selectedCountry = (countryData || []).find((item: any) => slugify(item.countryName || "") === countrySlug);
      const scopedChildren = countrySlug
        ? (root?.children || []).filter((item: any) => Number(item.countryId) === Number(selectedCountry?.id))
        : (root?.children || []);
      setUnits(scopedChildren.map((item: any) => ({
        slug: slugify(item.categoryName),
        label: item.categoryName,
        prefix: item.categoryName,
      })) || []);
      const selectedUnit = scopedChildren.find((item: any) => slugify(item.categoryName || "") === unitSlug);
      setPeriods((selectedUnit?.children || []).map((item: any) => ({
        slug: item.slug || slugify(item.categoryName || ""),
        label: item.categoryName,
        id: item.id,
      })));
      setUniforms((uniformData || []).filter((item: any) => item.category?.categoryType === "REENACTMENT"));
    };

    loadHierarchy();
    return () => { active = false; };
  }, [periodSlug, countrySlug]);

  const country = countries.find((item) => slugify(item.countryName || "") === countrySlug);
  const crumbs = ["Hoạt động", "Phục dựng", country?.countryName || (countrySlug ? "Quốc gia" : ""), unitSlug ? (units.find((unit) => unit.slug === unitSlug)?.label || "Đơn vị") : "", periodSlug ? (periods.find((period) => period.slug === periodSlug)?.label || "Giai đoạn") : ""].filter(Boolean);

  if (periodSlug) return <Detail period={periods.find((period) => period.slug === periodSlug)} crumbs={crumbs} country={country} uniforms={uniforms} unitSlug={unitSlug} />;
  const basePath = "/hoat-dong/phuc-dung";
  if (unitSlug) return <Cards title={units.find((unit) => unit.slug === unitSlug)?.prefix || "Đơn vị"} crumbs={crumbs} items={periods.map((period) => ({ to: `${basePath}/${countrySlug || "viet-nam"}/${unitSlug}/${period.slug}`, label: period.label }))} />;
  if (countrySlug) return <Cards title="Phục dựng trang phục" crumbs={crumbs} items={units.map((unit) => ({ to: `${basePath}/${countrySlug}/${unit.slug}`, label: unit.label }))} />;

  return <Cards title="Phục dựng trang phục" crumbs={crumbs} items={countries.map((item) => ({ to: `${basePath}/${slugify(item.countryName)}`, label: item.countryName, image: item.flagImageUrl }))} />;
}

function Shell({ crumbs, children }: { crumbs: string[]; children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-8 bg-white px-5 py-6 md:grid-cols-[1fr_290px]"><main><div className="mb-7 bg-[#f1f1f1] px-3 py-2 text-[16px] text-[#444]">{crumbs.join(" / ")}</div>{children}</main><LegacySidebar /></div>;
}

function Cards({ title, crumbs, items }: { title: string; crumbs: string[]; items: { to: string; label: string; image?: string }[] }) {
  return <Shell crumbs={crumbs}><h1 className="sr-only">{title}</h1><div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{items.map((item) => <Link key={item.to} to={item.to} className="group bg-[#f1f1f1] p-4 text-center"><div className="mb-3 flex aspect-[4/3] items-center justify-center bg-white">{item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <span className="text-5xl text-[#ddd]">▧</span>}</div><h2 className="font-sans text-[20px] font-bold text-black group-hover:text-[#b51f24]">{item.label}</h2></Link>)}</div></Shell>;
}

function Detail({ period, crumbs, country, uniforms, unitSlug }: { period?: { slug: string; label: string }; crumbs: string[]; country?: any; uniforms: any[]; unitSlug?: string }) {
  const countryId = country?.id;
  const records = countryId && period ? uniforms.filter((item) => item.country?.id === countryId && item.period === period.slug && (!unitSlug || slugify(item.category?.categoryName || "") === unitSlug)) : [];
  return <Shell crumbs={crumbs}>{period && (records.length ? <div className="space-y-10">{records.map((item: any) => <article key={item.id}><h1 className="mb-5 font-sans text-[28px] font-bold leading-tight">{item.name}</h1>{item.description && <p className="mb-6 whitespace-pre-line text-[17px] leading-7">{item.description}</p>}<h2 className="mb-4 bg-[#f1f1f1] px-3 py-2 font-sans text-[20px] font-bold text-[#b51f24]">▼ {period.label}</h2>{item.history && <p className="mb-6 whitespace-pre-line text-[17px] leading-7">{item.history}</p>}{item.images?.filter((image: any) => image.imageUrl || image.sensitive).length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-3">{item.images.filter((image: any) => image.imageUrl || image.sensitive).map((image: any) => <figure key={image.id}><SensitiveImage src={image.imageUrl || undefined} sensitive={Boolean(image.sensitive)} alt={image.description || item.name} className="aspect-[3/4] w-full object-cover" /><figcaption className="bg-[#f1f1f1] p-2 text-center text-sm italic">{image.description || item.name}</figcaption></figure>)}</div> : <p className="py-8 text-center text-[#777]">Nội dung này chưa có ảnh.</p>}</article>)}</div> : <div><h1 className="mb-5 font-sans text-[28px] font-bold leading-tight">Trang phục {country?.countryName || "phục dựng"} trong giai đoạn {period.label}</h1><p className="py-16 text-center text-[#777]">Chưa có nội dung phục dựng trong cơ sở dữ liệu.</p></div>) || <p className="py-16 text-center text-[#777]">Giai đoạn không tồn tại.</p>}</Shell>;
}
