import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { adminApi } from "@/api/adminApi";
import SensitiveImage from "@/components/SensitiveImage";
import ContentPageLayout, { ContentPageTitle } from "@/components/layout/ContentPageLayout";
import { useAuth } from "@/contexts/AuthContext";

const slugify = (value: string) => value
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/đ/g, "d")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

export default function ReenactmentHierarchyPage() {
  const { isAuthenticated } = useAuth();
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
  }, [periodSlug, countrySlug, unitSlug, isAuthenticated]);

  const country = countries.find((item) => slugify(item.countryName || "") === countrySlug);

  if (periodSlug) {
    return <Detail period={periods.find((period) => period.slug === periodSlug)} country={country} uniforms={uniforms} unitSlug={unitSlug} />;
  }

  const basePath = "/hoat-dong/phuc-dung";
  if (unitSlug) {
    return <Cards title={units.find((unit) => unit.slug === unitSlug)?.prefix || "Đơn vị"} items={periods.map((period) => ({
      to: `${basePath}/${countrySlug || "viet-nam"}/${unitSlug}/${period.slug}`,
      label: period.label,
    }))} />;
  }
  if (countrySlug) {
    return <Cards title="Phục dựng trang phục" items={units.map((unit) => ({
      to: `${basePath}/${countrySlug}/${unit.slug}`,
      label: unit.label,
    }))} />;
  }

  return <Cards title="Phục dựng trang phục" items={countries.map((item) => ({
    to: `${basePath}/${slugify(item.countryName)}`,
    label: item.countryName,
    image: item.flagImageUrl,
  }))} />;
}

function Cards({ title, items }: { title: string; items: { to: string; label: string; image?: string }[] }) {
  return (
    <ContentPageLayout>
      <main className="mx-auto w-full max-w-5xl">
        <ContentPageTitle className="mb-6 border-[#ddd]">{title}</ContentPageTitle>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {items.map((item) => (
            <Link key={item.to} to={item.to} className="group bg-[#f1f1f1] p-4 text-center">
              <div className="mb-3 flex aspect-[4/3] items-center justify-center bg-white">
                {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <span className="text-5xl text-[#ddd]">▧</span>}
              </div>
              <h2 className="font-display text-xl font-bold text-black group-hover:text-[#b51f24]">{item.label}</h2>
            </Link>
          ))}
        </div>
      </main>
    </ContentPageLayout>
  );
}

function Detail({ period, country, uniforms, unitSlug }: { period?: { id: number; slug: string; label: string }; country?: any; uniforms: any[]; unitSlug?: string }) {
  const countryId = country?.id;
  const records = countryId && period
    ? uniforms.filter((item) => item.country?.id === countryId
      && (Number(item.periodCategory?.id) === Number(period.id) || item.period === period.slug)
      && (!unitSlug || slugify(item.category?.categoryName || "") === unitSlug))
    : [];

  return (
    <ContentPageLayout>
      <main className="mx-auto w-full max-w-5xl">
        {period && (records.length ? (
          <div className="space-y-12">
            {records.map((item: any) => {
              const images = (item.images || []).filter((image: any) => image.imageUrl || image.sensitive);
              const galleryColumns = images.length === 1
                ? "grid-cols-1"
                : images.length === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1 md:grid-cols-3";

              return (
                <article key={item.id}>
                  <h1 className="mb-5 font-display text-3xl font-black leading-tight text-black md:text-4xl">{item.name}</h1>
                  {item.description && <p className="mb-7 whitespace-pre-line text-[17px] leading-7 text-[#444]">{item.description}</p>}
                  <h2 className="mb-4 border-l-4 border-brand-red bg-[#f1f1f1] px-3 py-2 font-sans text-[20px] font-bold text-[#b51f24]">▼ {period.label}</h2>
                  {item.history && <p className="mb-7 whitespace-pre-line text-[17px] leading-7 text-[#444]">{item.history}</p>}
                  {images.length ? (
                    <div className={`grid ${galleryColumns} gap-5`}>
                      {images.map((image: any) => (
                        <figure key={image.id}>
                          <SensitiveImage
                            src={image.imageUrl || undefined}
                            sensitive={Boolean(image.sensitive)}
                            alt={image.description || item.name}
                            className={`w-full object-contain ${images.length === 1 ? "max-h-[760px]" : "aspect-[3/4]"}`}
                          />
                          <figcaption className="bg-[#f1f1f1] p-2 text-center text-sm italic">{image.description || item.name}</figcaption>
                        </figure>
                      ))}
                    </div>
                  ) : <p className="py-8 text-center text-[#777]">Nội dung này chưa có ảnh.</p>}
                </article>
              );
            })}
          </div>
        ) : (
          <div>
            <h1 className="mb-5 font-display text-3xl font-black leading-tight">Trang phục {country?.countryName || "phục dựng"} trong giai đoạn {period.label}</h1>
            <p className="py-16 text-center text-[#777]">Chưa có nội dung phục dựng trong cơ sở dữ liệu.</p>
          </div>
        )) || <p className="py-16 text-center text-[#777]">Giai đoạn không tồn tại.</p>}
      </main>
    </ContentPageLayout>
  );
}
